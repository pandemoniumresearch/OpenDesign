'use client';
import { useState } from 'react';
import type { Provider } from '@/lib/ai/providers';
import type { Deck } from '@/lib/ai/generate-deck';

interface DeckPanelProps {
  projectId: string;
  provider: Provider;
  brandContext?: string;
  onGenerate: (result: { fullHtml: string; deck: Deck; artifactId?: string }) => void;
}

export function DeckPanel({ projectId, provider, brandContext, onGenerate }: DeckPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate/deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId, provider, brandContext }),
      });

      if (!res.ok) {
        const { error: err } = await res.json();
        throw new Error(err || 'Generation failed');
      }

      const { deck, fullHtml, artifactId } = await res.json();
      onGenerate({ fullHtml, deck, artifactId });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder={'Describe your deck…\ne.g. A pitch deck for a B2B SaaS analytics startup'}
        rows={4}
        className="w-full rounded-lg px-3 py-2.5 text-xs resize-none focus:outline-none transition-all leading-relaxed"
        style={{
          background: 'var(--bg-input)',
          border: '1px solid var(--bd-1)',
          color: 'var(--t1)',
        }}
        disabled={loading}
      />
      {error && (
        <p
          className="text-xs rounded-lg px-3 py-2 leading-relaxed"
          style={{ color: 'var(--err)', background: 'var(--err-bg)', border: '1px solid var(--err-bd)' }}
        >
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!prompt.trim() || loading}
        className="w-full py-2 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 text-white disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: 'var(--ac)' }}
      >
        {loading ? (
          <>
            <span className="animate-spin h-3 w-3 rounded-full" style={{ border: '1.5px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} />
            Generating deck…
          </>
        ) : (
          <>
            <SlidesIcon />
            Generate Deck
          </>
        )}
      </button>
    </form>
  );
}

function SlidesIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <rect x="1" y="1.5" width="9" height="6.5" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <path d="M3.5 9.5h4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M5.5 8V9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
