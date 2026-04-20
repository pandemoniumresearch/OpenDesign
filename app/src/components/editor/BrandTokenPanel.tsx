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
          className="flex-1 min-w-0 rounded-lg px-3 py-2 text-xs focus:outline-none transition-all"
          style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--bd-1)',
            color: 'var(--t1)',
          }}
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!url.trim() || loading}
          className="px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap disabled:opacity-40"
          style={{
            background: 'var(--ac-15)',
            border: '1px solid var(--ac-bd-25)',
            color: 'var(--ac)',
          }}
        >
          {loading ? (
            <span
              className="animate-spin h-3 w-3 rounded-full inline-block"
              style={{ border: '1.5px solid var(--ac-bd-25)', borderTopColor: 'var(--ac)' }}
            />
          ) : (
            'Extract'
          )}
        </button>
      </form>

      {error && (
        <p
          className="text-xs rounded-lg px-3 py-2"
          style={{ color: 'var(--err)', background: 'var(--err-bg)', border: '1px solid var(--err-bd)' }}
        >
          {error}
        </p>
      )}

      {brand && Array.isArray(brand.colors) && (
        <div className="rounded-lg p-3 space-y-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-1)' }}>
          <div className="flex flex-wrap gap-1">
            {brand.colors.slice(0, 12).map((c, i) => (
              <span
                key={i}
                title={c}
                className="w-5 h-5 rounded-md flex-shrink-0 shadow-sm"
                style={{ background: c, border: '1px solid rgba(0,0,0,0.10)' }}
              />
            ))}
          </div>
          {brand.fontFamilies.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium" style={{ color: 'var(--t5)' }}>Fonts:</span>
              <span className="text-[10px]" style={{ color: 'var(--t3)' }}>{brand.fontFamilies.slice(0, 3).join(', ')}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--ok)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--ok)' }}>Active — used in next generation</span>
          </div>
        </div>
      )}
    </div>
  );
}
