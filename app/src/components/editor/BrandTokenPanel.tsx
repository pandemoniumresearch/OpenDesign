'use client';
import { useState } from 'react';
import type { BrandContext } from '@/lib/ingestion/from-url';

interface BrandTokenPanelProps {
  projectId: string;
  onIngested: (ctx: BrandContext) => void;
  initialBrandContext?: BrandContext | null;
}

export function BrandTokenPanel({ projectId, onIngested, initialBrandContext }: BrandTokenPanelProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brand, setBrand] = useState<BrandContext | null>(initialBrandContext ?? null);

  async function handleIngest(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, projectId }),
      });

      if (!res.ok) {
        const { error: err } = await res.json();
        throw new Error(err || 'Ingestion failed');
      }

      const { brandContext } = await res.json();
      setBrand(brandContext);
      onIngested(brandContext);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ingestion failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2.5">
      <form onSubmit={handleIngest} className="flex gap-1.5">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className="flex-1 min-w-0 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="px-3 py-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 hover:border-violet-500/40 disabled:opacity-40 text-violet-300 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
        >
          {loading ? (
            <span className="animate-spin h-3 w-3 border-[1.5px] border-violet-400/30 border-t-violet-400 rounded-full inline-block" />
          ) : (
            'Extract'
          )}
        </button>
      </form>

      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {brand && Array.isArray(brand.colors) && (
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg p-3 space-y-2.5">
          <div className="flex flex-wrap gap-1">
            {brand.colors.slice(0, 12).map((c, i) => (
              <span
                key={i}
                title={c}
                className="w-5 h-5 rounded-md border border-black/20 flex-shrink-0 shadow-sm"
                style={{ background: c }}
              />
            ))}
          </div>
          {brand.fontFamilies.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-slate-600 font-medium">Fonts:</span>
              <span className="text-[10px] text-slate-400">{brand.fontFamilies.slice(0, 3).join(', ')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
            <span className="text-[10px] text-emerald-400 font-medium">Active — used in next generation</span>
          </div>
        </div>
      )}
    </div>
  );
}
