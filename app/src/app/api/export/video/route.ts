import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { html, css, js, durationSeconds = 5, fps = 30 } = await req.json() as {
    html: string; css: string; js: string; durationSeconds?: number; fps?: number;
  };

  const rendererUrl = process.env.VIDEO_RENDERER_URL || 'http://localhost:3001';

  const response = await fetch(`${rendererUrl}/render`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ html, css, js, durationSeconds, fps }),
    // Long timeout for video rendering
    signal: AbortSignal.timeout(280_000),
  });

  if (!response.ok) {
    const error = await response.text();
    return NextResponse.json({ error: `Renderer error: ${error}` }, { status: 502 });
  }

  const videoBuffer = await response.arrayBuffer();
  return new NextResponse(videoBuffer, {
    headers: {
      'Content-Type': 'video/mp4',
      'Content-Disposition': 'attachment; filename="prototype.mp4"',
    },
  });
}
