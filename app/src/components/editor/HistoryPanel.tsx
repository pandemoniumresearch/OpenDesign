'use client';
import { useEffect, useState, useCallback } from 'react';
import type { Prototype } from '@/lib/ai/generate-prototype';

interface Artifact {
  id: string;
  created_at: string;
  document: Prototype & { fullHtml: string; prompt: string };
}

interface HistoryPanelProps {
  projectId: string;
  onLoad: (result: { fullHtml: string; prototype: Prototype; artifactId: string }) => void;
}

export function HistoryPanel({ projectId, onLoad }: HistoryPanelProps) {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArtifacts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/artifacts?projectId=${projectId}`);
      if (!res.ok) throw new Error('Failed to load history');
      const { artifacts: data } = await res.json();
      setArtifacts(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => { fetchArtifacts(); }, [fetchArtifacts]);

  function handleLoad(artifact: Artifact) {
    const { fullHtml, prompt: _prompt, ...prototype } = artifact.document;
    onLoad({ fullHtml, prototype: prototype as Prototype, artifactId: artifact.id });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <span
          className="animate-spin h-4 w-4 rounded-full"
          style={{ border: '1.5px solid var(--bd-2)', borderTopColor: 'var(--ac)' }}
        />
      </div>
    );
  }

  if (error) {
    return <p className="text-[10px] px-1 py-2" style={{ color: 'var(--err)' }}>{error}</p>;
  }

  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
          style={{ background: 'var(--bg-canvas)', border: '1px solid var(--bd-1)' }}
        >
          <span className="text-base font-mono" style={{ color: 'var(--t5)' }}>◈</span>
        </div>
        <p className="text-[10px] leading-relaxed" style={{ color: 'var(--t5)' }}>No artifacts yet.<br />Generate something to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-end px-1 mb-1">
        <button
          onClick={fetchArtifacts}
          className="text-[10px] transition-colors p-1 rounded"
          style={{ color: 'var(--t5)' }}
        >
          ↺ Refresh
        </button>
      </div>
      {artifacts.map((artifact, i) => (
        <button
          key={artifact.id}
          onClick={() => handleLoad(artifact)}
          className="w-full text-left rounded-lg overflow-hidden transition-all group"
          style={{ border: '1px solid var(--bd-1)', background: 'var(--bg-card)' }}
        >
          {/* Thumbnail strip */}
          <div
            className="w-full h-8 opacity-80 group-hover:opacity-100 transition-opacity"
            style={{ background: `var(--thumb-${(i % 6) + 1})` }}
          />
          <div className="px-2.5 py-2">
            <p className="text-[11px] font-medium truncate transition-colors" style={{ color: 'var(--t2)' }}>
              {artifact.document.title || 'Untitled'}
            </p>
            <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--t5)' }}>
              {new Date(artifact.created_at).toLocaleString(undefined, {
                month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit',
              })}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
