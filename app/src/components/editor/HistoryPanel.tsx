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
        <span className="animate-spin h-4 w-4 border-[1.5px] border-white/10 border-t-slate-500 rounded-full" />
      </div>
    );
  }

  if (error) {
    return <p className="text-[10px] text-red-400 px-1 py-2">{error}</p>;
  }

  if (artifacts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-2 text-center">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-3">
          <span className="text-slate-600 text-base font-mono">◈</span>
        </div>
        <p className="text-[10px] text-slate-600 leading-relaxed">No artifacts yet.<br />Generate something to get started.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-end px-1 mb-1">
        <button
          onClick={fetchArtifacts}
          className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors p-1 rounded hover:bg-white/[0.05]"
          title="Refresh"
        >
          ↺ Refresh
        </button>
      </div>
      {artifacts.map((artifact, i) => (
        <button
          key={artifact.id}
          onClick={() => handleLoad(artifact)}
          className="w-full text-left rounded-lg overflow-hidden border border-white/[0.06] hover:border-indigo-500/30 bg-white/[0.03] hover:bg-indigo-500/[0.06] transition-all group"
        >
          {/* Thumbnail strip */}
          <div
            className="w-full h-8 opacity-60 group-hover:opacity-80 transition-opacity"
            style={{ background: THUMB_GRADIENTS[i % THUMB_GRADIENTS.length] }}
          />
          <div className="px-2.5 py-2">
            <p className="text-[11px] font-medium text-slate-300 truncate group-hover:text-white transition-colors">
              {artifact.document.title || 'Untitled'}
            </p>
            <p className="text-[10px] text-slate-600 mt-0.5 truncate">
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

const THUMB_GRADIENTS = [
  'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
  'linear-gradient(135deg, #10b981 0%, #0ea5e9 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
  'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
  'linear-gradient(135deg, #14b8a6 0%, #6366f1 100%)',
];
