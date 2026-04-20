import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)', color: 'var(--t1)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 h-14 border-b" style={{ borderColor: 'var(--bd-1)', background: 'var(--bg-panel)' }}>
        <span className="text-sm font-bold tracking-tight">
          <span style={{ color: 'var(--ac)' }}>Open</span>
          <span style={{ color: 'var(--t4)' }}>Design</span>
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/sign-in"
            className="text-sm px-3 py-1.5 transition-colors"
            style={{ color: 'var(--t3)' }}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="text-sm px-4 py-1.5 rounded-lg font-semibold transition-colors text-white"
            style={{ background: 'var(--ac)' }}
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center text-center px-6 pt-24 pb-16">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium mb-8"
          style={{ borderColor: 'var(--ac-bd-30)', background: 'var(--ac-08)', color: 'var(--ac)' }}
        >
          Open source · MIT license
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight max-w-4xl leading-[1.1]" style={{ color: 'var(--t1)' }}>
          Design at the
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, var(--ac), var(--ac-h))' }}
          > speed of thought</span>
        </h1>
        <p className="mt-6 text-lg max-w-2xl leading-relaxed" style={{ color: 'var(--t3)' }}>
          Generate HTML/CSS/JS prototypes from a prompt, ingest design tokens from any website,
          and export to HTML, PDF, or MP4 — with any AI model you choose.
        </p>
        <div className="mt-10 flex items-center gap-3">
          <Link
            href="/sign-up"
            className="px-6 py-3 rounded-xl font-semibold transition-colors text-sm text-white"
            style={{ background: 'var(--ac)' }}
          >
            Start designing free
          </Link>
          <a
            href="https://github.com/Pandemonium-Research/OpenDesign"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 border rounded-xl font-semibold transition-all text-sm"
            style={{ borderColor: 'var(--bd-2)', color: 'var(--t2)' }}
          >
            View source
          </a>
        </div>

        {/* Model logos row */}
        <div className="mt-12 flex items-center gap-5 text-xs" style={{ color: 'var(--t5)' }}>
          <span>Works with</span>
          {['Claude', 'GPT-4o', 'Gemini', 'Ollama'].map((m) => (
            <span key={m} className="font-medium" style={{ color: 'var(--t4)' }}>{m}</span>
          ))}
        </div>

        {/* App mockup */}
        <div className="mt-16 w-full max-w-4xl">
          <AppMockup />
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-t px-8 py-24" style={{ borderColor: 'var(--bd-1)' }}>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-3" style={{ color: 'var(--t1)' }}>
            The wedge no one has shipped
          </h2>
          <p className="text-center text-sm mb-14 max-w-xl mx-auto" style={{ color: 'var(--t4)' }}>
            Every OSS contender covers at most two of these. OpenDesign ships all three.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                label: 'Open source',
                desc: 'Self-host with Docker Compose. Fork it, audit it, own it. No vendor lock-in, no usage caps.',
                icon: '⬡',
                accentBg: 'var(--ac-04)',
                accentBd: 'var(--ac-bd-20)',
                iconColor: 'var(--ac)',
              },
              {
                label: 'Model-agnostic',
                desc: 'Claude Sonnet, GPT-4o, Gemini Flash, or run Llama locally with Ollama. Switch mid-session.',
                icon: '◈',
                accentBg: 'var(--ac2-04)',
                accentBd: 'var(--ac2-bd-20)',
                iconColor: 'var(--ac2)',
              },
              {
                label: 'Real video export',
                desc: 'The only tool that exports HTML/CSS/JS animations as actual MP4s — deterministic frame capture, no screen recording.',
                icon: '▷',
                accentBg: 'var(--ac3-04)',
                accentBd: 'var(--ac3-bd-20)',
                iconColor: 'var(--ac3)',
              },
            ].map((p) => (
              <div
                key={p.label}
                className="border rounded-2xl p-7"
                style={{ background: p.accentBg, borderColor: p.accentBd }}
              >
                <div className="text-2xl mb-4 font-mono" style={{ color: p.iconColor }}>{p.icon}</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--t1)' }}>{p.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--t4)' }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t px-8 py-24" style={{ borderColor: 'var(--bd-1)', background: 'var(--bg-canvas)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold mb-14" style={{ color: 'var(--t1)' }}>How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe', desc: 'Write a prompt. OpenDesign generates a complete HTML/CSS/JS prototype in seconds.' },
              { step: '02', title: 'Customize', desc: 'Paste any website URL to extract its design tokens — colors, fonts, spacing — and apply them to every generation.' },
              { step: '03', title: 'Export', desc: 'Download a static HTML bundle, a selectable PDF, or a real MP4 video of your animated prototype.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 2 && (
                  <div
                    className="hidden md:block absolute top-3 left-full w-full h-px -translate-x-4"
                    style={{ background: `linear-gradient(to right, var(--bd-2), transparent)` }}
                  />
                )}
                <div className="text-xs font-mono mb-3 font-bold" style={{ color: 'var(--ac)' }}>{s.step}</div>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--t1)' }}>{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--t4)' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t px-8 py-24 text-center" style={{ borderColor: 'var(--bd-1)' }}>
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--t1)' }}>Ready to start?</h2>
        <p className="mb-8 max-w-md mx-auto text-sm leading-relaxed" style={{ color: 'var(--t3)' }}>
          Free to use. Self-hostable. Your API keys, your models, your data.
        </p>
        <Link
          href="/sign-up"
          className="inline-block px-8 py-3.5 rounded-xl font-semibold transition-colors text-sm text-white"
          style={{ background: 'var(--ac)' }}
        >
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t px-8 py-6 flex items-center justify-between text-xs" style={{ borderColor: 'var(--bd-1)', background: 'var(--bg-panel)', color: 'var(--t5)' }}>
        <span>© 2026 Pandemonium Research</span>
        <div className="flex gap-4">
          <Link href="/sign-in" className="transition-colors hover:opacity-80">Sign in</Link>
          <a
            href="https://github.com/Pandemonium-Research/OpenDesign"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:opacity-80"
          >
            GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

function AppMockup() {
  return (
    <div className="rounded-2xl overflow-hidden text-left shadow-2xl" style={{ border: '1px solid var(--bd-1)', background: 'var(--bg-panel)', boxShadow: '0 25px 50px -12px var(--shadow-ac)' }}>
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-4 h-9 border-b" style={{ background: 'var(--bg-canvas)', borderColor: 'var(--bd-1)' }}>
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bd-2)' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bd-2)' }} />
        <span className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--bd-2)' }} />
        <div className="flex-1 mx-4 rounded-md h-4 border" style={{ background: 'var(--bg-input)', borderColor: 'var(--bd-1)' }} />
      </div>
      {/* App top bar */}
      <div className="flex items-center gap-3 px-4 h-10 border-b" style={{ background: 'var(--bg-panel)', borderColor: 'var(--bd-1)' }}>
        <span className="text-xs font-medium" style={{ color: 'var(--t3)' }}>← Projects</span>
        <div className="w-px h-4" style={{ background: 'var(--bd-2)' }} />
        <span className="text-xs font-medium" style={{ color: 'var(--t2)' }}>Product Launch Prototype</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="h-5 w-20 rounded border" style={{ background: 'var(--bg-input)', borderColor: 'var(--bd-1)' }} />
          <span className="text-xs font-bold">
            <span style={{ color: 'var(--ac)' }}>Open</span>
            <span style={{ color: 'var(--t4)' }}>Design</span>
          </span>
        </div>
      </div>
      {/* Three-column layout */}
      <div className="flex h-52">
        {/* Left */}
        <div className="w-40 border-r p-3 flex flex-col gap-2" style={{ borderColor: 'var(--bd-1)' }}>
          <p className="text-[9px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--t5)' }}>Artifacts</p>
          {[1, 2, 3].map((n) => (
            <div key={n} className="rounded-md overflow-hidden border" style={{ borderColor: 'var(--bd-1)' }}>
              <div className="h-6 opacity-80" style={{ background: `var(--thumb-${n})` }} />
              <div className="px-2 py-1" style={{ background: 'var(--bg-card)' }}>
                <p className="text-[9px]" style={{ color: 'var(--t3)' }}>{['Hero Section', 'Product Grid', 'Landing Page'][n - 1]}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Center canvas */}
        <div className="flex-1 flex flex-col" style={{ background: 'var(--bg-canvas)' }}>
          <div className="flex items-center h-8 px-3 border-b gap-2" style={{ borderColor: 'var(--bd-1)' }}>
            <span className="text-[9px] font-medium rounded px-2 py-0.5" style={{ color: 'var(--ac)', background: 'var(--ac-15)' }}>Prototype</span>
          </div>
          <div className="flex-1 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.5]"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--dot) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div
              className="absolute inset-0"
              style={{ background: 'radial-gradient(ellipse at center, transparent 25%, var(--vignette) 70%)' }}
            />
            <div
              className="relative w-28 h-36 rounded-xl flex flex-col items-center justify-center gap-2 shadow-lg"
              style={{ background: 'var(--ac-15)', border: '1px solid var(--ac-bd-25)' }}
            >
              <div className="w-16 h-1.5 rounded-full" style={{ background: 'var(--ac-25)' }} />
              <div className="w-10 h-1 rounded-full" style={{ background: 'var(--ac-15)' }} />
              <div className="mt-1 w-12 h-4 rounded-md" style={{ background: 'var(--ac-25)', border: '1px solid var(--ac-bd-30)' }} />
            </div>
          </div>
        </div>
        {/* Right panel */}
        <div className="w-56 border-l p-3 flex flex-col gap-3" style={{ borderColor: 'var(--bd-1)' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded flex items-center justify-center text-[8px]" style={{ background: 'var(--ac-15)', color: 'var(--ac)' }}>✦</span>
            <span className="text-[9px] font-semibold" style={{ color: 'var(--t2)' }}>AI Generation</span>
          </div>
          <div className="border rounded-lg p-2 h-16" style={{ background: 'var(--bg-input)', borderColor: 'var(--bd-1)' }}>
            <p className="text-[8px] leading-relaxed" style={{ color: 'var(--t5)' }}>A product launch hero with animated gradient background and CTA button…</p>
          </div>
          <div className="h-5 rounded-md flex items-center justify-center" style={{ background: 'var(--ac)' }}>
            <span className="text-[8px] text-white font-semibold">Generate</span>
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            {['.zip', '.pdf', '.mp4'].map((ext) => (
              <div key={ext} className="flex items-center gap-2 px-2 py-1.5 rounded-md border" style={{ background: 'var(--bg-card)', borderColor: 'var(--bd-1)' }}>
                <span className="text-[8px] font-mono w-5" style={{ color: 'var(--sky)' }}>{ext}</span>
                <div className="h-1.5 flex-1 rounded-full" style={{ background: 'var(--bd-2)' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
