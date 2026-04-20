'use client';
import { useState } from 'react';
import type { Prototype } from '@/lib/ai/generate-prototype';

interface ExportPanelProps {
  prototype: Prototype | null;
  fullHtml: string;
  artifactId?: string;
}

type ExportFormat = 'html' | 'pdf' | 'video';

const FORMATS: { format: ExportFormat; label: string; ext: string; desc: string; iconColor: string; iconBg: string }[] = [
  { format: 'html',  label: 'HTML Bundle', ext: '.zip', desc: 'Static HTML/CSS/JS', iconColor: 'text-sky-400',   iconBg: 'bg-sky-500/10' },
  { format: 'pdf',   label: 'PDF',         ext: '.pdf', desc: 'Selectable text',    iconColor: 'text-rose-400',  iconBg: 'bg-rose-500/10' },
  { format: 'video', label: 'MP4 Video',   ext: '.mp4', desc: 'Deterministic 60fps', iconColor: 'text-amber-400', iconBg: 'bg-amber-500/10' },
];

export function ExportPanel({ prototype, fullHtml, artifactId }: ExportPanelProps) {
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doExport(format: ExportFormat) {
    if (!prototype || exporting) return;
    setExporting(format);
    setError(null);

    try {
      const res = await fetch(`/api/export/${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: prototype.html,
          css: prototype.css,
          js: prototype.js,
          title: prototype.title,
          artifactId,
          durationSeconds: 5,
          fps: 30,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Export failed');
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const slug = prototype.title.replace(/\s+/g, '-').toLowerCase();
      a.download = format === 'html' ? `${slug}.zip`
        : format === 'pdf' ? `${slug}.pdf`
        : 'prototype.mp4';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(null);
    }
  }

  const disabled = !prototype;

  return (
    <div className="flex flex-col gap-1.5">
      {FORMATS.map(({ format, label, ext, desc, iconColor, iconBg }) => {
        const isLoading = exporting === format;
        return (
          <button
            key={format}
            onClick={() => doExport(format)}
            disabled={disabled || !!exporting}
            className="flex items-center gap-2.5 px-3 py-2.5 bg-white/3 hover:bg-white/6 border border-white/[0.07] hover:border-white/12 disabled:opacity-35 disabled:cursor-not-allowed rounded-lg transition-all text-left group"
          >
            {/* Icon badge */}
            <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center shrink-0`}>
              {isLoading
                ? <span className="animate-spin h-3 w-3 border-[1.5px] border-white/20 border-t-white/70 rounded-full" />
                : <span className={`text-[10px] font-bold font-mono ${iconColor}`}>{ext}</span>
              }
            </div>
            {/* Label + desc */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-200 group-hover:text-white transition-colors leading-none">
                {isLoading ? 'Exporting…' : label}
              </p>
              <p className="text-[10px] text-slate-600 mt-1 leading-none">{desc}</p>
            </div>
          </button>
        );
      })}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {disabled && (
        <p className="text-[10px] text-slate-600 text-center mt-1">Generate a prototype first</p>
      )}
    </div>
  );
}
