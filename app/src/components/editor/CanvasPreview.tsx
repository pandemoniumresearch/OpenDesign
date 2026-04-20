'use client';

interface CanvasPreviewProps {
  html: string;
}

export function CanvasPreview({ html }: CanvasPreviewProps) {
  if (!html) {
    return (
      <div className="w-full h-full flex items-center justify-center select-none">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl border border-slate-800 bg-slate-900 flex items-center justify-center mx-auto mb-5">
            <span className="text-slate-600 text-xl font-mono">◈</span>
          </div>
          <p className="text-slate-500 text-sm font-medium">Write a prompt to generate a prototype</p>
          <p className="text-slate-700 text-xs mt-1">Your design will appear here</p>
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
