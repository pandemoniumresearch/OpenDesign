'use client';
import { useState } from 'react';
import type { Prototype } from '@/lib/ai/generate-prototype';

interface ExportPanelProps {
  prototype: Prototype | null;
  fullHtml: string;
  artifactId?: string;
}

type ExportFormat = 'html' | 'pdf' | 'video';

const FORMATS: { format: ExportFormat; label: string; ext: string; desc: string; colorVar: string; bgVar: string }[] = [
  { format: 'html',  label: 'HTML Bundle', ext: '.zip', desc: 'Static HTML/CSS/JS', colorVar: 'var(--sky)',  bgVar: 'var(--sky-15)' },
  { format: 'pdf',   label: 'PDF',         ext: '.pdf', desc: 'Selectable text',    colorVar: 'var(--rose)', bgVar: 'var(--rose-15)' },
  { format: 'video', label: 'MP4 Video',   ext: '.mp4', desc: 'Deterministic 60fps', colorVar: 'var(--amb)', bgVar: 'var(--amb-15)' },
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
      {FORMATS.map(({ format, label, ext, desc, colorVar, bgVar }) => {
        const isLoading = exporting === format;
        return (
          <button
            key={format}
            onClick={() => doExport(format)}
            disabled={disabled || !!exporting}
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all text-left group disabled:opacity-35 disabled:cursor-not-allowed"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-1)' }}
          >
            {/* Icon badge */}
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ background: bgVar }}
            >
              {isLoading
                ? <span
                    className="animate-spin h-3 w-3 rounded-full"
                    style={{ border: '1.5px solid var(--ac-15)', borderTopColor: 'var(--ac)' }}
                  />
                : <span className="text-[10px] font-bold font-mono" style={{ color: colorVar }}>{ext}</span>
              }
            </div>
            {/* Label + desc */}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium leading-none transition-colors" style={{ color: 'var(--t1)' }}>
                {isLoading ? 'Exporting…' : label}
              </p>
              <p className="text-[10px] mt-1 leading-none" style={{ color: 'var(--t5)' }}>{desc}</p>
            </div>
          </button>
        );
      })}
      {error && <p className="text-xs mt-1" style={{ color: 'var(--err)' }}>{error}</p>}
      {disabled && (
        <p className="text-[10px] text-center mt-1" style={{ color: 'var(--t5)' }}>Generate a prototype first</p>
      )}
    </div>
  );
}
