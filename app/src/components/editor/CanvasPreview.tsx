'use client';

interface CanvasPreviewProps {
  html: string;
}

export function CanvasPreview({ html }: CanvasPreviewProps) {
  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 25%, var(--vignette) 70%)' }}
        />
        <div className="relative text-center z-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg"
            style={{ border: '1px solid var(--bd-1)', background: 'var(--bg-panel)' }}
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4L16.5 10.5H23L17.8 14.4L19.8 21L14 17.1L8.2 21L10.2 14.4L5 10.5H11.5L14 4Z"
                fill="url(#canvasGrad)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="canvasGrad" x1="5" y1="4" x2="23" y2="21">
                  <stop offset="0%" stopColor="var(--ac)" />
                  <stop offset="100%" stopColor="var(--ac2)" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-sm font-medium mb-1.5" style={{ color: 'var(--t3)' }}>
            Write a prompt to generate a prototype
          </p>
          <p className="text-xs" style={{ color: 'var(--t5)' }}>
            Your design will appear here
          </p>
        </div>
      </div>
    );
  }

  return (
    <iframe
      srcDoc={html}
      className="w-full h-full border-0"
      sandbox="allow-scripts"
      title="Prototype preview"
    />
  );
}
