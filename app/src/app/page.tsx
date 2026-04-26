import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="grain-stage" style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Watercolor splash layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
        <svg viewBox="0 0 1440 1800" preserveAspectRatio="xMidYMin slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          <g className="splash" filter="url(#watercolor-blur)">
            <ellipse cx="220"  cy="220"  rx="280" ry="240" fill="url(#rg-lav)" />
            <ellipse cx="1280" cy="180"  rx="320" ry="260" fill="url(#rg-peach)" />
            <ellipse cx="720"  cy="560"  rx="220" ry="180" fill="url(#rg-butter)" />
            <ellipse cx="120"  cy="760"  rx="240" ry="200" fill="url(#rg-mint)" />
            <ellipse cx="1320" cy="900"  rx="280" ry="240" fill="url(#rg-sky)" />
            <ellipse cx="340"  cy="1380" rx="300" ry="220" fill="url(#rg-rose)" />
            <ellipse cx="1180" cy="1500" rx="260" ry="220" fill="url(#rg-lav)" />
            <ellipse cx="700"  cy="1720" rx="340" ry="220" fill="url(#rg-peach)" />
          </g>
          <g className="splash" filter="url(#watercolor-soft)">
            <circle cx="440"  cy="360"  r="46" fill="url(#rg-rose)" />
            <circle cx="1040" cy="320"  r="34" fill="url(#rg-lav)" />
            <circle cx="880"  cy="820"  r="28" fill="url(#rg-mint)" />
            <circle cx="260"  cy="1060" r="38" fill="url(#rg-butter)" />
          </g>
        </svg>
      </div>

      {/* All content above the splash */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 40px' }}>
          <BrandLogo />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NavLink href="/docs">Docs</NavLink>
            <NavLink href="https://github.com/Pandemonium-Research/OpenDesign">GitHub</NavLink>
            <NavLink href="/sign-in">Sign in</NavLink>
            <ThemeToggle />
            <PrimaryBtn href="/sign-up">Get started →</PrimaryBtn>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ textAlign: 'center', padding: '80px 24px 100px', maxWidth: 980, margin: '0 auto' }}>
          {/* Eyebrow */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 500, color: 'var(--ac)',
            padding: '7px 14px', borderRadius: 999,
            background: 'var(--ac-bg)', border: '1px solid rgba(122,104,200,0.2)',
            marginBottom: 32, letterSpacing: '-0.005em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block', boxShadow: '0 0 0 3px rgba(122,104,200,0.18)' }} />
            Open source · MIT license
          </div>

          {/* Heading */}
          <h1 className="serif" style={{
            fontWeight: 400, fontSize: 'clamp(56px, 8vw, 104px)',
            lineHeight: 0.95, letterSpacing: '-0.025em',
            color: 'var(--ink)', margin: '0 0 24px',
          }}>
            Design at the{' '}
            <em className="hero-em">speed</em>{' '}
            of thought
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--ink-2)', maxWidth: 620, margin: '0 auto 40px', fontWeight: 400, letterSpacing: '-0.005em' }}>
            Generate HTML/CSS/JS prototypes from a prompt, ingest design tokens from any website, and export to HTML, PDF, or MP4. Works with any AI model you choose.
          </p>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 56 }}>
            <PrimaryBtn href="/sign-up" large>Start designing free →</PrimaryBtn>
            <GhostBtn href="https://github.com/Pandemonium-Research/OpenDesign" large>View source</GhostBtn>
          </div>

          {/* Works with */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, fontSize: 12, color: 'var(--ink-4)', marginBottom: 72 }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 10, fontFamily: 'var(--font-geist-mono)' }}>Works with</span>
            {['Claude', 'GPT-4o', 'Gemini', 'Ollama'].map((m) => (
              <span key={m} style={{ color: 'var(--ink-2)', fontWeight: 500, letterSpacing: '-0.005em', fontSize: 13 }}>{m}</span>
            ))}
          </div>

          {/* App mockup */}
          <AppMockup />
        </section>

        {/* Pillars */}
        <section style={{ padding: '100px 40px 40px', maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="serif" style={{ fontWeight: 400, fontSize: 44, lineHeight: 1.05, textAlign: 'center', margin: '0 0 12px', letterSpacing: '-0.02em', color: 'var(--ink)' }}>
            The wedge no one has shipped
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--ink-3)', fontSize: 15, maxWidth: 540, margin: '0 auto 56px', lineHeight: 1.5 }}>
            Every OSS contender covers at most two of these. OpenDesign ships all three.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              { num: '01 / SOURCE', title: 'Open & yours.', desc: 'Self-host with Docker Compose. Fork it, audit it, own it. No vendor lock-in, no usage caps.', grad: 'rg-lav' },
              { num: '02 / MODELS', title: 'Any brain you bring.', desc: 'Claude Sonnet, GPT-4o, Gemini Flash, or run Llama locally with Ollama. Switch mid-session.', grad: 'rg-peach' },
              { num: '03 / EXPORT', title: 'Real video, really.', desc: 'The only tool that exports HTML/CSS/JS animations as actual MP4s. Deterministic frame capture, no screen recording.', grad: 'rg-mint' },
            ].map((p) => (
              <div key={p.num} style={{ position: 'relative', padding: '32px 28px 28px', borderRadius: 20, background: 'var(--paper)', border: '1px solid var(--rule)', overflow: 'hidden' }}>
                <svg style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, pointerEvents: 'none', opacity: 0.75 }} viewBox="0 0 200 200">
                  <g filter="url(#watercolor-soft)"><ellipse cx="100" cy="100" rx="90" ry="75" fill={`url(#${p.grad})`} /></g>
                </svg>
                <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, color: 'var(--ac)', letterSpacing: '0.08em' }}>{p.num}</div>
                <h3 className="serif" style={{ fontWeight: 400, fontStyle: 'italic', fontSize: 28, letterSpacing: '-0.015em', margin: '12px 0 10px' }}>{p.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: '100px 40px', maxWidth: 1120, margin: '0 auto' }}>
          <h2 className="serif" style={{ fontWeight: 400, textAlign: 'center', fontSize: 44, margin: '0 0 56px', letterSpacing: '-0.02em' }}>
            How it works
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 48 }}>
            {[
              { step: '01', title: 'Describe.', desc: 'Write a prompt. OpenDesign generates a complete HTML/CSS/JS prototype in seconds.' },
              { step: '02', title: 'Customize.', desc: 'Paste any website URL to extract its design tokens (colors, fonts, spacing) and apply them to every generation.' },
              { step: '03', title: 'Export.', desc: 'Download a static HTML bundle, a selectable PDF, or a real MP4 video of your animated prototype.' },
            ].map((s) => (
              <div key={s.step}>
                <div style={{ fontFamily: 'var(--font-geist-mono)', color: 'var(--ac)', fontSize: 12, letterSpacing: '0.1em', marginBottom: 12, fontWeight: 600 }}>{s.step}</div>
                <h3 className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 26, margin: '0 0 10px', letterSpacing: '-0.01em' }}>{s.title}</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: 'var(--ink-2)', margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: '120px 24px 100px', textAlign: 'center', position: 'relative' }}>
          <h2 className="serif" style={{ fontWeight: 400, fontSize: 68, margin: '0 0 20px', letterSpacing: '-0.025em', lineHeight: 1 }}>
            Ready to <em style={{ fontStyle: 'italic', color: 'var(--ac)' }}>start?</em>
          </h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 15, maxWidth: 420, margin: '0 auto 32px' }}>
            Free to use. Self-hostable. Your API keys, your models, your data.
          </p>
          <PrimaryBtn href="/sign-up" large>Get started free →</PrimaryBtn>
        </section>

        {/* Footer */}
        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 40px', borderTop: '1px solid var(--rule)', fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-geist-mono)' }}>
          <span>© 2026 Pandemonium Research</span>
          <div>
            <Link href="/sign-in" style={{ color: 'var(--ink-3)', textDecoration: 'none', marginLeft: 20 }}>Sign in</Link>
            <a href="https://github.com/Pandemonium-Research/OpenDesign" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)', textDecoration: 'none', marginLeft: 20 }}>GitHub</a>
            <Link href="/docs" style={{ color: 'var(--ink-3)', textDecoration: 'none', marginLeft: 20 }}>Docs</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function BrandLogo() {
  return (
    <div style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center' }}>
      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)', marginRight: 8, boxShadow: '0 0 12px var(--ac-soft)', verticalAlign: 'middle' }} />
      <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 20, color: 'var(--ac)', letterSpacing: '-0.01em', marginRight: 1 }}>Open</span>
      Design
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} style={{ fontSize: 13, color: 'var(--ink-3)', padding: '8px 14px', textDecoration: 'none', borderRadius: 999, fontWeight: 500, transition: 'all 160ms ease' }}>
      {children}
    </a>
  );
}

function PrimaryBtn({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  const pad = large ? '13px 26px' : '9px 18px';
  const size = large ? 14 : 13;
  return (
    <Link href={href} className="btn-wc-primary" style={{ fontSize: size, padding: pad }}>
      {children}
    </Link>
  );
}

function GhostBtn({ href, children, large }: { href: string; children: React.ReactNode; large?: boolean }) {
  const pad = large ? '13px 26px' : '9px 18px';
  const size = large ? 14 : 13;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'transparent', color: 'var(--ink-2)', border: '1px solid var(--rule-2)', fontSize: size, fontWeight: 500, padding: pad, borderRadius: 999, textDecoration: 'none', transition: 'all 160ms ease' }}>
      {children}
    </a>
  );
}

// ─── App mockup ───────────────────────────────────────────────────────────────

function AppMockup() {
  return (
    <div style={{ maxWidth: 1040, margin: '0 auto', background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>
      {/* Browser chrome */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', background: 'var(--paper-2)', borderBottom: '1px solid var(--rule)' }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rule-2)', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rule-2)', display: 'inline-block' }} />
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--rule-2)', display: 'inline-block' }} />
        <div style={{ flex: 1, margin: '0 12px', height: 22, borderRadius: 7, background: 'var(--paper)', border: '1px solid var(--rule)', display: 'flex', alignItems: 'center', padding: '0 10px', fontFamily: 'var(--font-geist-mono)', fontSize: 10.5, color: 'var(--ink-4)' }}>
          opendesign.app / product-launch-prototype
        </div>
      </div>

      {/* App top bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--rule)', fontSize: 12, color: 'var(--ink-3)' }}>
        <span>← Projects</span>
        <div style={{ width: 1, height: 14, background: 'var(--rule-2)' }} />
        <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>Product Launch Prototype</span>
        <div style={{ flex: 1 }} />
        <span style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--paper-2)', border: '1px solid var(--rule)', fontSize: 11, fontFamily: 'var(--font-geist-mono)' }}>claude-4-sonnet</span>
        <span style={{ fontSize: 12, fontWeight: 600 }}>
          <span className="serif" style={{ fontStyle: 'italic', color: 'var(--ac)', fontFamily: 'var(--font-instrument-serif)', fontWeight: 400, fontSize: 15 }}>Open</span>Design
        </span>
      </div>

      {/* Three-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr 240px', minHeight: 280 }}>
        {/* Sidebar */}
        <aside style={{ borderRight: '1px solid var(--rule)', padding: '14px 12px' }}>
          <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-4)', marginBottom: 12, fontWeight: 600, fontFamily: 'var(--font-geist-mono)' }}>Artifacts</div>
          {[
            { name: 'Hero section', grad1: 'rg-lav', grad2: 'rg-peach', cx1: 30, cy1: 20, rx1: 30, ry1: 22, cx2: 80, cy2: 25, rx2: 20, ry2: 18 },
            { name: 'Product grid', grad1: 'rg-mint', grad2: 'rg-butter', cx1: 50, cy1: 20, rx1: 36, ry1: 20, cx2: 82, cy2: 30, rx2: 16, ry2: 14 },
            { name: 'Landing page', grad1: 'rg-sky', grad2: 'rg-rose', cx1: 25, cy1: 25, rx1: 28, ry1: 20, cx2: 75, cy2: 18, rx2: 22, ry2: 18 },
          ].map((a) => (
            <div key={a.name} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
              <div style={{ height: 42, borderRadius: 8, overflow: 'hidden', position: 'relative' }}>
                <svg viewBox="0 0 100 42" preserveAspectRatio="none" style={{ width: '100%', height: '100%', display: 'block' }}>
                  <rect width="100" height="42" fill="var(--paper-2)" />
                  <g className="splash" filter="url(#watercolor-soft)">
                    <ellipse cx={a.cx1} cy={a.cy1} rx={a.rx1} ry={a.ry1} fill={`url(#${a.grad1})`} />
                    <ellipse cx={a.cx2} cy={a.cy2} rx={a.rx2} ry={a.ry2} fill={`url(#${a.grad2})`} />
                  </g>
                </svg>
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--ink-2)', paddingLeft: 2 }}>{a.name}</div>
            </div>
          ))}
        </aside>

        {/* Canvas */}
        <div style={{ background: 'var(--paper-2)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--rule)', fontSize: 10, fontFamily: 'var(--font-geist-mono)', color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            <span style={{ color: 'var(--ac)' }}>⬡ Prototype</span>
            <span style={{ marginLeft: 10, opacity: 0.6 }}>Code</span>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', backgroundImage: 'radial-gradient(var(--rule-2) 0.8px, transparent 0.8px)', backgroundSize: '14px 14px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 30%, var(--paper-2) 80%)' }} />
            {/* Artwork card */}
            <div style={{ position: 'relative', zIndex: 1, width: 140, height: 160, borderRadius: 12, background: 'var(--paper)', border: '1px solid var(--rule)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, boxShadow: '0 20px 40px -15px rgba(122,104,200,0.25)' }}>
              <div style={{ position: 'absolute', inset: 8, borderRadius: 8, overflow: 'hidden', zIndex: 0 }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%' }}>
                  <g className="splash" filter="url(#watercolor-soft)">
                    <ellipse cx="80" cy="15" rx="30" ry="24" fill="url(#rg-peach)" />
                    <ellipse cx="15" cy="85" rx="28" ry="22" fill="url(#rg-lav)" />
                  </g>
                </svg>
              </div>
              <div style={{ width: '70%', height: 6, borderRadius: 3, background: 'var(--ink-5)', zIndex: 1, position: 'relative' }} />
              <div style={{ width: '40%', height: 4, borderRadius: 2, background: 'var(--ink-5)', zIndex: 1, position: 'relative' }} />
              <div style={{ width: 56, height: 18, borderRadius: 5, background: 'var(--ac)', zIndex: 1, position: 'relative', marginTop: 4 }} />
            </div>
          </div>
        </div>

        {/* Prompt panel */}
        <aside style={{ borderLeft: '1px solid var(--rule)', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 9.5, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--ink-4)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ac)', fontSize: 11 }}>✦</span> AI generation
          </div>
          <div style={{ background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 10, padding: 10, fontSize: 10.5, color: 'var(--ink-3)', lineHeight: 1.5, minHeight: 60 }}>
            A product launch hero with soft watercolor background, elegant serif headline, and an understated CTA.
          </div>
          <div className="gen-btn-wc" style={{ height: 30, borderRadius: 8, fontSize: 11 }}>
            Generate
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 'auto' }}>
            {['.zip', '.pdf', '.mp4'].map((ext) => (
              <div key={ext} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 9px', border: '1px solid var(--rule)', borderRadius: 7, background: 'var(--paper)', fontFamily: 'var(--font-geist-mono)', fontSize: 10, color: 'var(--ink-3)' }}>
                <span>{ext}</span>
                <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'var(--rule-2)' }} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
