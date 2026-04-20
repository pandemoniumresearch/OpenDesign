'use client';
import { useState } from 'react';
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
}

export function EditorClient({ projectId, projectName }: EditorClientProps) {
  const [provider, setProvider] = useState<Provider>('anthropic');
  const [fullHtml, setFullHtml] = useState('');
  const [prototype, setPrototype] = useState<Prototype | null>(null);
  const [brandContext, setBrandContext] = useState<BrandContext | null>(null);

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="flex items-center gap-4 px-4 py-3 border-b border-slate-800 flex-shrink-0">
        <a href="/" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">← Projects</a>
        <h1 className="text-sm font-medium text-white truncate flex-1">{projectName}</h1>
        <span className="text-xs text-slate-600">OpenDesign</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-72 flex-shrink-0 flex flex-col gap-5 p-4 border-r border-slate-800 overflow-y-auto bg-slate-900/50">
          <ProviderSelector value={provider} onChange={setProvider} />
          <BrandTokenPanel
            projectId={projectId}
            onIngested={(ctx) => setBrandContext(ctx)}
          />
          <PromptPanel
            projectId={projectId}
            provider={provider}
            brandContext={brandContext?.brandContextString}
            onGenerate={({ fullHtml, prototype: p }) => {
              setFullHtml(fullHtml);
              setPrototype(p);
            }}
          />
          <ExportPanel prototype={prototype} fullHtml={fullHtml} />
          <HistoryPanel
            projectId={projectId}
            onLoad={({ fullHtml: h, prototype: p }) => {
              setFullHtml(h);
              setPrototype(p);
            }}
          />
        </aside>

        {/* Canvas area */}
        <main className="flex-1 overflow-hidden p-4 bg-slate-950">
          <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
            <CanvasPreview html={fullHtml} />
          </div>
        </main>
      </div>
    </div>
  );
}
