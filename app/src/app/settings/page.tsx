import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SettingsClient } from './SettingsClient';

function decode(enc: string | null | undefined): { isSet: boolean; masked?: string } {
  if (!enc) return { isSet: false };
  try {
    const plain = decrypt(enc);
    const masked = plain.length <= 4 ? '••••' : `••••••••${plain.slice(-4)}`;
    return { isSet: true, masked };
  } catch {
    return { isSet: false };
  }
}

export default async function SettingsPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createClient();
  const { data } = await supabase
    .from('user_api_keys')
    .select('anthropic_key, openai_key, google_key')
    .eq('user_id', userId)
    .single();

  const initialStatus = {
    anthropic: decode(data?.anthropic_key),
    openai:    decode(data?.openai_key),
    google:    decode(data?.google_key),
  };

  return (
    <div className="grain-stage" style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Watercolor splash */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          <g className="splash" filter="url(#watercolor-blur)">
            <ellipse cx="1300" cy="140" rx="280" ry="220" fill="url(#rg-lav)" />
            <ellipse cx="160"  cy="760" rx="260" ry="200" fill="url(#rg-mint)" />
          </g>
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 56, borderBottom: '1px solid var(--rule)' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--ac)', marginRight: 8, boxShadow: '0 0 12px var(--ac-soft)' }} />
            <span className="serif" style={{ fontStyle: 'italic', fontWeight: 400, fontSize: 20, color: 'var(--ac)', letterSpacing: '-0.01em', marginRight: 1 }}>Open</span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Design</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/dashboard" style={{ fontSize: 13, color: 'var(--ink-3)', padding: '8px 14px', textDecoration: 'none', borderRadius: 999, fontWeight: 500 }}>Dashboard</Link>
            <ThemeToggle />
            <UserButton />
          </div>
        </nav>

        <main style={{ maxWidth: 680, margin: '0 auto', padding: '56px 40px 100px' }}>
          <div style={{ marginBottom: 40 }}>
            <h1 className="serif" style={{ fontWeight: 400, fontSize: 48, margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              <em style={{ fontStyle: 'italic', color: 'var(--ac)' }}>Settings</em>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, lineHeight: 1.6 }}>
              Add your own API keys. Keys are encrypted at rest and never shared.
            </p>
          </div>

          <SettingsClient initialStatus={initialStatus} />
        </main>
      </div>
    </div>
  );
}
