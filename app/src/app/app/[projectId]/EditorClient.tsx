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

  function handleGenerated(result: { fullHtml: string; prototype: Prototype; artifactId?: string }) {
    setFullHtml(result.fullHtml);
    setPrototype(result.prototype);
    setArtifactId(result.artifactId);
  }

  return (
    <div className="h-screen flex flex-col bg-[#0d0d12] text-slate-100">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-11 border-b border-white/[0.06] shrink-0 bg-[#111118]">
        <a
          href="/dashboard"
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-200 transition-colors shrink-0 group"
        >
          <ChevronLeftIcon />
          <span className="text-xs font-medium">Projects</span>
        </a>
        <div className="w-px h-4 bg-white/[0.08] shrink-0" />
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="flex-1 min-w-0 text-sm font-medium text-slate-200 bg-transparent focus:outline-none truncate placeholder-slate-600 hover:text-white focus:text-white transition-colors"
          placeholder="Untitled Project"
          aria-label="Project name"
        />
        <div className="ml-auto flex items-center gap-2.5 shrink-0">
          <ProviderSelector value={provider} onChange={setProvider} compact />
          <div className="w-px h-4 bg-white/[0.08]" />
          <LogoMark />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Artifacts panel */}
        <aside className="w-[196px] shrink-0 flex flex-col border-r border-white/[0.06] bg-[#111118] overflow-hidden">
          <SectionHeader label="Artifacts" />
          <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
            <HistoryPanel
              projectId={projectId}
              onLoad={handleGenerated}
            />
          </div>
        </aside>

        {/* Center: Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#09090e]">
          <div className="flex items-center px-4 h-10 border-b border-white/[0.06] shrink-0 bg-[#0d0d12] gap-2">
            <CanvasTab active>Prototype</CanvasTab>
            <div className="ml-auto flex items-center gap-2">
              {prototype && (
                <span className="text-[10px] text-slate-600 font-mono truncate max-w-[160px]">
                  {prototype.title}
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <CanvasPreview html={fullHtml} />
          </div>
        </main>

        {/* Right: AI Command panel */}
        <aside className="w-[268px] shrink-0 flex flex-col border-l border-white/[0.06] overflow-y-auto bg-[#111118]">
          {/* AI Generation */}
          <PanelSection icon={<SparkleIcon />} iconBg="bg-indigo-500/15" label="AI Generation">
            <PromptPanel
              projectId={projectId}
              provider={provider}
              brandContext={brandContext?.brandContextString}
              onGenerate={handleGenerated}
            />
          </PanelSection>

          <PanelDivider />

          {/* Brand Tokens */}
          <PanelSection icon={<TokenIcon />} iconBg="bg-violet-500/15" label="Brand Tokens">
            <BrandTokenPanel
              projectId={projectId}
              initialBrandContext={initialBrandContext}
              onIngested={(ctx) => setBrandContext(ctx)}
            />
          </PanelSection>

          <PanelDivider />

          {/* Export */}
          <PanelSection icon={<ExportIcon />} iconBg="bg-emerald-500/15" label="Export">
            <ExportPanel prototype={prototype} fullHtml={fullHtml} artifactId={artifactId} />
          </PanelSection>
        </aside>
      </div>
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 pt-3 pb-2 shrink-0">
      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function PanelSection({
  icon, iconBg, label, children,
}: {
  icon: React.ReactNode; iconBg: string; label: string; children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3 p-4">
      <div className="flex items-center gap-2">
        <span className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center flex-shrink-0`}>
          {icon}
        </span>
        <span className="text-xs font-semibold text-slate-200">{label}</span>
      </div>
      {children}
    </section>
  );
}

function PanelDivider() {
  return <div className="h-px bg-white/[0.05] mx-4 shrink-0" />;
}

function CanvasTab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
        active
          ? 'bg-indigo-500/15 text-indigo-300'
          : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
      }`}
    >
      {children}
    </button>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeftIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <path d="M8 2.5L4.5 6.5L8 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1L5.9 3.6L8.5 3.6L6.4 5.2L7.3 7.8L5 6.2L2.7 7.8L3.6 5.2L1.5 3.6L4.1 3.6L5 1Z" fill="#818cf8" />
    </svg>
  );
}

function TokenIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <circle cx="5" cy="5" r="3.5" stroke="#a78bfa" strokeWidth="1.4" />
      <circle cx="5" cy="5" r="1.5" fill="#a78bfa" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M5 1.5V6.5M3 4.5L5 6.5L7 4.5M2.5 8.5H7.5" stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoMark() {
  return (
    <span className="text-xs font-bold tracking-tight">
      <span className="text-indigo-400">Open</span>
      <span className="text-slate-400">Design</span>
    </span>
  );
}
