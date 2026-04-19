/**
 * OpenDesign Video Renderer Service
 *
 * Standalone Express server that accepts HTML/CSS/JS and exports MP4 via
 * Puppeteer + virtual-clock injection + FFmpeg.
 *
 * In production: runs in a Docker container on Cloud Run (Linux, chrome-headless-shell).
 * For local dev: uses the system Chrome executable via CHROME_PATH env var.
 */

import express from 'express';
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const CHROME_PATH = process.env.CHROME_PATH || '/usr/bin/google-chrome-stable';
const WIDTH = 1280;
const HEIGHT = 720;

// Virtual clock — patches JS time APIs for rAF-based animation determinism.
// CSS compositor animations require --enable-begin-frame-control (available in
// chrome-headless-shell on Linux; not available in Chrome 127+ with new headless).
const VIRTUAL_CLOCK_SCRIPT = `
(function() {
  let _now = 0;
  const OrigDate = Date;
  window.Date = class extends OrigDate {
    constructor(...args) { super(args.length === 0 ? _now : args[0]); }
    static now() { return _now; }
  };
  performance.now = () => _now;

  let _timerId = 1;
  const _timers = new Map();
  window.setTimeout = (fn, delay = 0, ...args) => {
    const id = _timerId++;
    _timers.set(id, { fn, fireAt: _now + delay, args, repeat: false });
    return id;
  };
  window.clearTimeout = (id) => _timers.delete(id);
  window.setInterval = (fn, delay = 0, ...args) => {
    const id = _timerId++;
    _timers.set(id, { fn, fireAt: _now + delay, delay, args, repeat: true });
    return id;
  };
  window.clearInterval = (id) => _timers.delete(id);

  const _rafCallbacks = new Map();
  let _rafId = 1;
  window.requestAnimationFrame = (fn) => {
    const id = _rafId++;
    _rafCallbacks.set(id, fn);
    return id;
  };
  window.cancelAnimationFrame = (id) => _rafCallbacks.delete(id);

  window.__advanceClock = function(deltaMs) {
    _now += deltaMs;
    for (const [id, t] of [..._timers.entries()]) {
      if (_now >= t.fireAt) {
        try { t.fn(...t.args); } catch(e) {}
        if (t.repeat) t.fireAt += t.delay; else _timers.delete(id);
      }
    }
    const pending = [..._rafCallbacks.entries()];
    _rafCallbacks.clear();
    for (const [id, fn] of pending) { try { fn(_now); } catch(e) {} }
  };

  let _seed = 42;
  Math.random = () => { _seed = (_seed * 9301 + 49297) % 233280; return _seed / 233280; };
})();
`;

function buildHtml(html: string, css: string, js: string): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
${css}
</style>
</head>
<body>
${html}
${js ? `<script>\n${js}\n</script>` : ''}
</body>
</html>`;
}

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.post('/render', async (req, res) => {
  const { html = '', css = '', js = '', durationSeconds = 5, fps = 30 } = req.body as {
    html?: string; css?: string; js?: string; durationSeconds?: number; fps?: number;
  };

  const totalFrames = Math.round(durationSeconds * fps);
  const frameInterval = 1000 / fps;

  console.log(`[renderer] Starting render: ${durationSeconds}s @ ${fps}fps = ${totalFrames} frames`);

  let browser: Awaited<ReturnType<typeof puppeteer.launch>> | null = null;

  try {
    browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: [
        `--window-size=${WIDTH},${HEIGHT}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        // These flags enable CSS-level determinism (effective with chrome-headless-shell on Linux)
        '--run-all-compositor-stages-before-draw',
        '--disable-threaded-animation',
        '--disable-threaded-scrolling',
        '--deterministic-mode',
        '--enable-begin-frame-control',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
    await page.setContent(buildHtml(html, css, js), { waitUntil: 'networkidle0' });
    await page.evaluate(VIRTUAL_CLOCK_SCRIPT);
    await page.evaluate(() => (globalThis as unknown as { document: { fonts: { ready: Promise<unknown> } } }).document.fonts.ready);

    // Try to use HeadlessExperimental.beginFrame (Linux chrome-headless-shell only)
    let cdp: Awaited<ReturnType<typeof page.createCDPSession>> | null = null;
    let useBeginFrame = false;
    try {
      cdp = await page.createCDPSession();
      await cdp.send('HeadlessExperimental.enable' as Parameters<typeof cdp.send>[0]);
      useBeginFrame = true;
      console.log('[renderer] HeadlessExperimental.beginFrame available — full CSS determinism');
    } catch {
      console.log('[renderer] HeadlessExperimental not available — falling back to page.screenshot()');
    }

    // Set up FFmpeg to encode frames as they arrive
    const ffmpeg = spawn('ffmpeg', [
      '-y',
      '-f', 'image2pipe',
      '-framerate', String(fps),
      '-i', 'pipe:0',
      '-vf', `scale=${WIDTH}:${HEIGHT}`,
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      '-f', 'mp4',
      'pipe:1', // output to stdout
    ]);

    const chunks: Buffer[] = [];
    ffmpeg.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
    ffmpeg.stderr.on('data', () => {}); // suppress

    const ffmpegDone = new Promise<void>((resolve, reject) =>
      ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`))))
    );

    for (let i = 0; i < totalFrames; i++) {
      await page.evaluate((delta: number) => (globalThis as unknown as { __advanceClock: (d: number) => void }).__advanceClock(delta), frameInterval);

      let pngBuffer: Buffer;
      if (useBeginFrame && cdp) {
        const result = await cdp.send('HeadlessExperimental.beginFrame' as Parameters<typeof cdp.send>[0], {
          frameTimeTicks: i * frameInterval * 1000,
          interval: frameInterval,
          noDisplayUpdates: false,
          screenshot: { format: 'png' },
        } as Record<string, unknown>);
        pngBuffer = Buffer.from((result as { screenshotData?: string }).screenshotData || '', 'base64');
      } else {
        pngBuffer = Buffer.from(await page.screenshot({ type: 'png' }));
      }

      ffmpeg.stdin.write(pngBuffer);
    }

    ffmpeg.stdin.end();
    await ffmpegDone;
    await browser.close();
    browser = null;

    const mp4 = Buffer.concat(chunks);
    console.log(`[renderer] Done. Output: ${(mp4.length / 1024).toFixed(0)} KB`);

    res.set({
      'Content-Type': 'video/mp4',
      'Content-Length': String(mp4.length),
      'Content-Disposition': 'attachment; filename="prototype.mp4"',
    }).send(mp4);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Render failed';
    console.error('[renderer] Error:', message);
    if (browser) await browser.close().catch(() => {});
    if (!res.headersSent) {
      res.status(500).json({ error: message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`[renderer] Video renderer running on port ${PORT}`);
  console.log(`[renderer] Chrome: ${CHROME_PATH}`);
});
