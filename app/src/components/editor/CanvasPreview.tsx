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
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.25) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        {/* Radial vignette */}
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 25%, #09090e 70%)' }}
        />
        <div className="relative text-center z-10">
          <div className="w-16 h-16 rounded-2xl border border-white/8 bg-white/4 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-black/40">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 4L16.5 10.5H23L17.8 14.4L19.8 21L14 17.1L8.2 21L10.2 14.4L5 10.5H11.5L14 4Z"
                fill="url(#canvasGrad)"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="canvasGrad" x1="5" y1="4" x2="23" y2="21">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-medium mb-1.5">
            Write a prompt to generate a prototype
          </p>
          <p className="text-slate-600 text-xs">
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
