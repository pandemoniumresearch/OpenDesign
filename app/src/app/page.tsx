import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-slate-800/60">
        <span className="font-semibold text-white tracking-tight">OpenDesign</span>
        <div className="flex items-center gap-3">
          <Link href="/sign-in"
            className="text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5">
            Sign in
          </Link>
          <Link href="/sign-up"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-medium transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-32">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-medium mb-8">
          Open source · MIT license
        </div>
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-4xl leading-tight">
          Design at the
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"> speed of thought</span>
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl leading-relaxed">
          Generate HTML/CSS/JS prototypes from a prompt, ingest design tokens from any website,
          and export to HTML, PDF, or MP4 — with any AI model you choose.
        </p>
        <div className="mt-10 flex items-center gap-4">
          <Link href="/sign-up"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors text-sm">
            Start designing free
          </Link>
          <a href="https://github.com/Pandemonium-Research/OpenDesign"
            target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors text-sm">
            View source
          </a>
        </div>

        {/* Model logos row */}
        <div className="mt-16 flex items-center gap-6 text-slate-600 text-xs">
          <span>Works with</span>
          {['Claude', 'GPT-4o', 'Gemini', 'Ollama'].map((m) => (
            <span key={m} className="text-slate-500 font-medium">{m}</span>
          ))}
        </div>
      </section>

      {/* Three pillars */}
      <section className="border-t border-slate-800/60 px-8 py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-3">
            The wedge no one has shipped
          </h2>
          <p className="text-center text-slate-500 text-sm mb-16 max-w-xl mx-auto">
            Every OSS contender covers at most two of these. OpenDesign ships all three.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                label: 'Open source',
                desc: 'Self-host with Docker Compose. Fork it, audit it, own it. No vendor lock-in, no usage caps.',
                icon: '⬡',
              },
              {
                label: 'Model-agnostic',
                desc: 'Claude Sonnet, GPT-4o, Gemini Flash, or run Llama locally with Ollama. Switch mid-session.',
                icon: '◈',
              },
              {
                label: 'Real video export',
                desc: 'The only tool that exports HTML/CSS animations as actual MP4s — deterministic frame capture, no screen recording.',
                icon: '▷',
              },
            ].map((p) => (
              <div key={p.label} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-7">
                <div className="text-indigo-400 text-2xl mb-4 font-mono">{p.icon}</div>
                <h3 className="text-white font-semibold mb-2">{p.label}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-slate-800/60 px-8 py-24 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-2xl font-bold text-white mb-16">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', title: 'Describe', desc: 'Write a prompt. OpenDesign generates a complete HTML/CSS/JS prototype in seconds.' },
              { step: '02', title: 'Customize', desc: 'Paste any website URL to extract its design tokens — colors, fonts, spacing — and apply them to every generation.' },
              { step: '03', title: 'Export', desc: 'Download a static HTML bundle, a selectable PDF, or a real MP4 video of your animated prototype.' },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-4 left-full w-full h-px bg-gradient-to-r from-slate-700 to-transparent -translate-x-4" />
                )}
                <div className="text-xs font-mono text-indigo-500 mb-3">{s.step}</div>
                <h3 className="text-white font-semibold mb-2">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-slate-800/60 px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to start?</h2>
        <p className="text-slate-400 mb-8 max-w-md mx-auto text-sm">
          Free to use. Self-hostable. Your API keys, your models, your data.
        </p>
        <Link href="/sign-up"
          className="inline-block px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-colors text-sm">
          Get started free
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 px-8 py-6 flex items-center justify-between text-xs text-slate-600">
        <span>© 2026 Pandemonium Research</span>
        <div className="flex gap-4">
          <Link href="/sign-in" className="hover:text-slate-400 transition-colors">Sign in</Link>
          <a href="https://github.com/Pandemonium-Research/OpenDesign" target="_blank" rel="noopener noreferrer" className="hover:text-slate-400 transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
