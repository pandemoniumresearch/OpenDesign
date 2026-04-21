'use client';
import { useState, useRef } from 'react';
import { CanvasPreview } from '@/components/editor/CanvasPreview';
import { PromptPanel } from '@/components/editor/PromptPanel';
import { ProviderSelector } from '@/components/editor/ProviderSelector';
import { BrandTokenPanel } from '@/components/editor/BrandTokenPanel';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { HistoryPanel } from '@/components/editor/HistoryPanel';
import { ThemeToggle } from '@/components/ThemeToggle';
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Top bar */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 18px', height: 52, borderBottom: '1px solid var(--rule)', background: 'var(--paper)', backdropFilter: 'blur(10px)', position: 'relative', zIndex: 5, flexShrink: 0 }}>
        <a
          href="/dashboard"
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--ink-3)', fontSize: 12.5, textDecoration: 'none', fontWeight: 500, flexShrink: 0 }}
        >
          ← Projects
        </a>
        <div style={{ width: 1, height: 18, background: 'var(--rule-2)', flexShrink: 0 }} />
        <input
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="serif"
          style={{ flex: 1, minWidth: 0, fontSize: 19, fontStyle: 'italic', fontWeight: 400, background: 'transparent', border: 'none', outline: 'none', color: 'var(--ink)', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          placeholder="Untitled Project"
          aria-label="Project name"
        />
        <div style={{ width: 1, height: 18, background: 'var(--rule-2)', flexShrink: 0 }} />
        <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--ink-4)', flexShrink: 0 }}>SAVED · 2m</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {/* Provider indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 8px', borderRadius: 999, border: '1px solid var(--rule-2)', fontSize: 12, color: 'var(--ink-2)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--pigment-mint)', display: 'inline-block' }} />
            <ProviderSelector value={provider} onChange={setProvider} compact />
          </div>
          <div style={{ width: 1, height: 18, background: 'var(--rule-2)' }} />
          <ThemeToggle />
          <LogoMark />
        </div>
      </header>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '220px 1fr 320px', overflow: 'hidden' }}>
        {/* Left: Artifacts */}
        <aside style={{ borderRight: '1px solid var(--rule)', padding: '18px 14px', overflow: 'auto', background: 'var(--paper)' }}>
          <EdSectionHead label="Artifacts" action="+" />
          <HistoryPanel projectId={projectId} onLoad={handleGenerated} />

          <div style={{ marginTop: 28 }}>
            <EdSectionHead label="History" />
          </div>
        </aside>

        {/* Center: Canvas */}
        <main style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', background: 'var(--paper-2)' }}>
          {/* Watercolor background for canvas */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
            <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
              <g className="splash" filter="url(#watercolor-blur)">
                <ellipse cx="720" cy="450" rx="420" ry="300" fill="url(#rg-lav)" opacity="0.35" />
                <ellipse cx="200" cy="300" rx="180" ry="140" fill="url(#rg-peach)" opacity="0.4" />
                <ellipse cx="1240" cy="700" rx="220" ry="170" fill="url(#rg-mint)" opacity="0.4" />
              </g>
            </svg>
          </div>

          {/* Tabs */}
          <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--rule)', display: 'flex', gap: 4, background: 'var(--paper)', position: 'relative', zIndex: 2, flexShrink: 0 }}>
            <CanvasTab active>⬡ Preview</CanvasTab>
            <CanvasTab>Code</CanvasTab>
            <CanvasTab>Tokens</CanvasTab>
            <div style={{ flex: 1 }} />
            <CanvasTab>Desktop</CanvasTab>
            <CanvasTab>Tablet</CanvasTab>
            <CanvasTab>Mobile</CanvasTab>
            {prototype && (
              <span style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--ink-5)', display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                {prototype.title}
              </span>
            )}
          </div>

          {/* Canvas area */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            <CanvasPreview html={fullHtml} />
          </div>
        </main>

        {/* Right: AI panel */}
        <aside style={{ borderLeft: '1px solid var(--rule)', padding: '18px 16px', background: 'var(--paper)', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Describe */}
          <PanelGroup>
            <h3 className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 20, margin: '0 0 4px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Describe</h3>
            <p style={{ fontSize: 11.5, color: 'var(--ink-4)', margin: '0 0 10px' }}>Write a prompt — be specific about tone & structure.</p>
            <PromptPanel
              projectId={projectId}
              provider={provider}
              brandContext={brandContext?.brandContextString}
              onGenerate={handleGenerated}
            />
          </PanelGroup>

          <PanelDivider />

          {/* Palette / Brand Tokens */}
          <PanelGroup>
            <h3 className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 20, margin: '0 0 4px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Palette</h3>
            <p style={{ fontSize: 11.5, color: 'var(--ink-4)', margin: '0 0 10px' }}>Extract tokens from any site URL.</p>
            {/* Color swatches */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {[
                { bg: 'var(--pigment-lavender)', sel: true },
                { bg: 'var(--pigment-peach)',    sel: false },
                { bg: 'var(--pigment-mint)',     sel: false },
                { bg: 'var(--pigment-butter)',   sel: false },
                { bg: 'var(--pigment-sky)',      sel: false },
                { bg: 'var(--pigment-rose)',     sel: false },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{ width: 28, height: 28, borderRadius: '50%', background: s.bg, border: '1px solid var(--rule-2)', cursor: 'pointer', position: 'relative', boxShadow: s.sel ? '0 0 0 2.5px var(--paper), 0 0 0 4px var(--ink)' : 'inset 0 1px 2px rgba(0,0,0,0.04)' }}
                />
              ))}
            </div>
            <BrandTokenPanel
              projectId={projectId}
              initialBrandContext={initialBrandContext}
              onIngested={(ctx) => setBrandContext(ctx)}
            />
          </PanelGroup>

          <PanelDivider />

          {/* Export */}
          <PanelGroup>
            <h3 className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 20, margin: '0 0 4px', color: 'var(--ink)', letterSpacing: '-0.01em' }}>Export</h3>
            <p style={{ fontSize: 11.5, color: 'var(--ink-4)', margin: '0 0 10px' }}>Deterministic output, yours to keep.</p>
            <ExportPanel prototype={prototype} fullHtml={fullHtml} artifactId={artifactId} />
          </PanelGroup>
        </aside>
      </div>
    </div>
  );
}

// ─── Layout primitives ────────────────────────────────────────────────────────

function EdSectionHead({ label, action }: { label: string; action?: string }) {
  return (
    <div style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-4)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span>{label}</span>
      {action && <span style={{ color: 'var(--ink-4)' }}>{action}</span>}
    </div>
  );
}

function PanelGroup({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ paddingTop: 16, marginTop: 2 }}>
      {children}
    </div>
  );
}

function PanelDivider() {
  return <div style={{ height: 1, background: 'var(--rule)', margin: '14px 0 0' }} />;
}

function CanvasTab({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <button
      className={active ? 'tab-wc-active' : undefined}
      style={active
        ? { fontSize: 12, padding: '6px 12px', borderRadius: 999 }
        : { fontSize: 12, padding: '6px 12px', borderRadius: 999, color: 'var(--ink-3)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }
      }
    >
      {children}
    </button>
  );
}

function LogoMark() {
  return (
    <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: '-0.02em' }}>
      <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 16, color: 'var(--ac)', letterSpacing: '-0.01em' }}>Open</span>
      Design
    </span>
  );
}
