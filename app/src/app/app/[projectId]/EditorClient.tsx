'use client';
import { useState, useRef } from 'react';
import { CanvasPreview } from '@/components/editor/CanvasPreview';
import { PromptPanel } from '@/components/editor/PromptPanel';
import { ProviderSelector } from '@/components/editor/ProviderSelector';
import { BrandTokenPanel } from '@/components/editor/BrandTokenPanel';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { HistoryPanel } from '@/components/editor/HistoryPanel';
import type { Provider } from '@/lib/ai/providers';
import type { Prototype } from '@/lib/ai/generate-prototype';
import type { BrandContext } from '@/lib/ingestion/from-url';

interface EditorClientProps {
  projectId: string;
  projectName: string;
  initialBrandContext: BrandContext | null;
}

export function EditorClient({ projectId, projectName, initialBrandContext }: EditorClientProps) {
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [fullHtml, setFullHtml] = useState('');
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [artifactId, setArtifactId] = useState<string | undefined>(undefined);
  const [brandContext, setBrandContext] = useState<BrandContext | null>(initialBrandContext);
  const [name, setName] = useState(projectName);
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleNameChange(value: string) {
    setName(value);
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      await fetch(`/api/projects/${projectId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
      });
    }, 600);
  }

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-800 shrink-0 bg-slate-950">
        <a href="/dashboard" className="text-slate-500 hover:text-slate-300 text-sm transition-colors shrink-0 flex items-center gap-1.5">
          <span className="text-xs">←</span>
          <span className="text-xs font-medium">Projects</span>
        </a>
        <div className="h-4 w-px bg-slate-800 shrink-0" />
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 min-w-0 text-sm font-medium text-white bg-transparent focus:outline-none truncate placeholder-slate-600"
          placeholder="Untitled Project"
          aria-label="Project name"
        />
        <div className="shrink-0">
          <ProviderSelector value={provider} onChange={setProvider} compact />
        </div>
        <div className="h-4 w-px bg-slate-800 shrink-0" />
        <span className="text-xs text-slate-700 shrink-0 font-medium tracking-wide">OpenDesign</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-64 shrink-0 flex flex-col border-r border-slate-800 overflow-y-auto bg-slate-900/40">
          <div className="flex flex-col gap-0 p-4 pb-0">
            <PromptPanel
              projectId={projectId}
              provider={provider}
              brandContext={brandContext?.brandContextString}
              onGenerate={({ fullHtml: h, prototype: p, artifactId: id }) => {
                setFullHtml(h);
                setPrototype(p);
                setArtifactId(id);
              }}
            />
          </div>

          <Divider />

          <div className="px-4">
            <BrandTokenPanel
              projectId={projectId}
              initialBrandContext={initialBrandContext}
              onIngested={(ctx) => setBrandContext(ctx)}
            />
          </div>

          <Divider />

          <div className="px-4">
            <ExportPanel prototype={prototype} fullHtml={fullHtml} artifactId={artifactId} />
          </div>

          <Divider />

          <div className="px-4 pb-4">
            <HistoryPanel
              projectId={projectId}
              onLoad={({ fullHtml: h, prototype: p, artifactId: id }) => {
                setFullHtml(h);
                setPrototype(p);
                setArtifactId(id);
              }}
            />
          </div>
        </aside>

        {/* Canvas */}
        <main className="flex-1 overflow-hidden bg-[#0c0c0f]">
          <CanvasPreview html={fullHtml} />
        </main>
      </div>
    </div>
  );
}

function Divider() {
  return <div className="h-px bg-slate-800 mx-4 my-4 shrink-0" />;
}
