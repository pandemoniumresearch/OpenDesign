/**
 * Video spike: virtual-clock + page.screenshot() + FFmpeg → MP4
 *
 * HeadlessExperimental.beginFrame was removed in Chrome 127+.
 * For Chrome 147 (system install), we use page.screenshot() after advancing
 * the virtual clock. True compositor-level determinism requires chrome-headless-shell
 * with --enable-begin-frame-control (production renderer will use Docker + pinned shell).
 * This spike proves the end-to-end pipeline: HTML → frames → MP4.
 */

import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const OUTPUT_FILE = 'output.mp4';
const FPS = 30;
const DURATION_SECONDS = 5;
const WIDTH = 1280;
const HEIGHT = 720;
const TOTAL_FRAMES = FPS * DURATION_SECONDS;

const DEMO_HTML = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    display: flex; align-items: center; justify-content: center;
    font-family: system-ui, sans-serif;
    overflow: hidden;
  }
  .container { text-align: center; }
  .logo {
    width: 120px; height: 120px; margin: 0 auto 32px;
    background: linear-gradient(45deg, #e94560, #0f3460);
    border-radius: 24px;
  }
  .title {
    font-size: 48px; font-weight: 700; color: white;
  }
  .subtitle {
    font-size: 20px; color: rgba(255,255,255,0.6); margin-top: 12px;
  }
  .bar {
    width: 200px; height: 4px; background: rgba(255,255,255,0.15);
    border-radius: 2px; margin: 24px auto 0; overflow: hidden;
  }
  .bar-fill {
    height: 100%; background: linear-gradient(90deg, #e94560, #7209b7);
    border-radius: 2px; width: 0%;
    transition: none;
  }
</style>
</head>
<body>
  <div class="container">
    <div class="logo" id="logo"></div>
    <div class="title">OpenDesign</div>
    <div class="subtitle">Model-agnostic · OSS · Video export</div>
    <div class="bar"><div class="bar-fill" id="progress"></div></div>
  </div>
  <script>
    // JS-driven animation — controlled via virtual clock
    let startTime = null;
    const logo = document.getElementById('logo');
    const progress = document.getElementById('progress');
    const DURATION = ${DURATION_SECONDS * 1000};

    function animate(t) {
      if (startTime === null) startTime = t;
      const elapsed = t - startTime;
      const pct = Math.min(elapsed / DURATION, 1);
      const angle = pct * 360 * 3;
      const scale = 1 + Math.sin(pct * Math.PI * 4) * 0.1;
      logo.style.transform = 'rotate(' + angle + 'deg) scale(' + scale + ')';
      progress.style.width = (pct * 100) + '%';
      requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  </script>
</body>
</html>`;

// Virtual clock: patches JS time APIs for deterministic frame-by-frame control.
// CSS compositor transitions still run on wall-clock time in this mode — that's why
// the production renderer needs chrome-headless-shell + --enable-begin-frame-control.
// For JS-driven animations (rAF), this gives full determinism.
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
  window.requestAnimationFrame = (fn) => { const id = _rafId++; _rafCallbacks.set(id, fn); return id; };
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

async function main() {
  console.log('Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      `--window-size=${WIDTH},${HEIGHT}`,
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });
  await page.evaluateOnNewDocument(VIRTUAL_CLOCK_SCRIPT);

  console.log('Loading demo HTML...');
  // setContent doesn't trigger evaluateOnNewDocument — inject clock after load
  await page.setContent(DEMO_HTML, { waitUntil: 'networkidle0' });
  await page.evaluate(VIRTUAL_CLOCK_SCRIPT);
  await page.evaluate(() => document.fonts.ready);

  // Start FFmpeg: reads PNG images from stdin, encodes H.264 MP4
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-framerate', String(FPS),
    '-i', 'pipe:0',
    '-vf', `scale=${WIDTH}:${HEIGHT}`,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    OUTPUT_FILE,
  ]);

  ffmpeg.stderr.on('data', () => {}); // suppress ffmpeg output
  const ffmpegDone = new Promise((resolve, reject) =>
    ffmpeg.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`FFmpeg exited ${code}`))))
  );

  const frameInterval = 1000 / FPS;

  console.log(`Capturing ${TOTAL_FRAMES} frames at ${FPS}fps (${DURATION_SECONDS}s)...`);
  const start = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    await page.evaluate((delta) => window.__advanceClock(delta), frameInterval);
    const png = await page.screenshot({ type: 'png', clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT } });
    ffmpeg.stdin.write(png);

    if (i % FPS === 0) {
      const elapsed = ((Date.now() - start) / 1000).toFixed(1);
      process.stdout.write(`  Frame ${i}/${TOTAL_FRAMES} — ${elapsed}s elapsed\r`);
    }
  }

  const totalTime = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nAll ${TOTAL_FRAMES} frames captured in ${totalTime}s. Finalizing MP4...`);
  ffmpeg.stdin.end();
  await ffmpegDone;
  await browser.close();

  const ratio = (DURATION_SECONDS / parseFloat(totalTime)).toFixed(2);
  console.log(`\nSUCCESS: ${OUTPUT_FILE} written (${ratio}x realtime).`);
  console.log('NOTE: Production renderer uses chrome-headless-shell + --enable-begin-frame-control for CSS determinism.');
  console.log('Video spike PASSED — virtual-clock + screenshot + FFmpeg pipeline works.');
}

main().catch((err) => {
  console.error('FAILED:', err.message);
  process.exit(1);
});
