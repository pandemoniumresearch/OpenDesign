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
        placeholder={'Describe what to design…\ne.g. A dark hero section with animated gradient and CTA button'}
        rows={5}
        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-xs text-slate-200 placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.06] transition-all leading-relaxed"
        disabled={loading}
      />
      {error && (
        <p className="text-xs text-red-400 bg-red-950/30 border border-red-800/40 rounded-lg px-3 py-2 leading-relaxed">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!prompt.trim() || loading}
        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
      >
        {loading ? (
          <>
            <span className="animate-spin h-3 w-3 border-[1.5px] border-white/30 border-t-white rounded-full" />
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
