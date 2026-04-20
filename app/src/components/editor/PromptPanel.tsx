'use client';
import { useState } from 'react';
import type { Provider } from '@/lib/ai/providers';
import type { Prototype } from '@/lib/ai/generate-prototype';

interface PromptPanelProps {
  projectId: string;
  provider: Provider;
  brandContext?: string;
  onGenerate: (result: { fullHtml: string; prototype: Prototype; artifactId?: string }) => void;
}

export function PromptPanel({ projectId, provider, brandContext, onGenerate }: PromptPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectId, provider, brandContext }),
      });

      if (!res.ok) {
        const { error: err } = await res.json();
        throw new Error(err || 'Generation failed');
      }

      const { prototype, fullHtml, artifactId } = await res.json();
      onGenerate({ fullHtml, prototype, artifactId });
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
        placeholder={'Describe what to design…\ne.g. A hero section with animated gradient and CTA button'}
        rows={5}
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
            Generating…
          </>
        ) : (
          <>
            <SparkleIcon />
            Generate
          </>
        )}
      </button>
    </form>
  );
}

function SparkleIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
      <path d="M5.5 1L6.5 4H9.5L7 5.8L8 8.5L5.5 6.8L3 8.5L4 5.8L1.5 4H4.5L5.5 1Z" fill="currentColor" />
    </svg>
  );
}
