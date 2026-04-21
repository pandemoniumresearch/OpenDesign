import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserButton } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DeleteProjectButton } from './DeleteProjectButton';
import { ThemeToggle } from '@/components/ThemeToggle';

const THUMB_PATTERNS = [
  { g1: 'rg-lav',    g2: 'rg-peach',  e1: { cx: 80,  cy: 60,  rx: 90,  ry: 60  }, e2: { cx: 240, cy: 110, rx: 80, ry: 55 } },
  { g1: 'rg-mint',   g2: 'rg-butter', e1: { cx: 160, cy: 70,  rx: 110, ry: 70  }, e2: { cx: 260, cy: 30,  rx: 50, ry: 40 } },
  { g1: 'rg-sky',    g2: 'rg-rose',   e1: { cx: 100, cy: 90,  rx: 90,  ry: 55  }, e2: { cx: 240, cy: 50,  rx: 70, ry: 55 } },
  { g1: 'rg-butter', g2: 'rg-lav',    e1: { cx: 180, cy: 50,  rx: 120, ry: 60  }, e2: { cx: 60,  cy: 120, rx: 70, ry: 50 } },
  { g1: 'rg-rose',   g2: 'rg-peach',  e1: { cx: 140, cy: 80,  rx: 130, ry: 70  }, e2: { cx: 280, cy: 130, rx: 50, ry: 40 } },
  { g1: 'rg-sky',    g2: 'rg-mint',   e1: { cx: 200, cy: 75,  rx: 100, ry: 65  }, e2: { cx: 60,  cy: 110, rx: 70, ry: 50 } },
];

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  async function deleteProject(formData: FormData) {
    'use server';
    const projectId = formData.get('projectId') as string;
    const supabase = await createClient();
    await supabase.from('projects').delete().eq('id', projectId);
    revalidatePath('/dashboard');
  }

  const count = projects?.length ?? 0;

  return (
    <div className="grain-stage" style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      {/* Watercolor splash */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }} aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
          <g className="splash" filter="url(#watercolor-blur)">
            <ellipse cx="160"  cy="140" rx="280" ry="220" fill="url(#rg-lav)" />
            <ellipse cx="1300" cy="220" rx="260" ry="220" fill="url(#rg-mint)" />
            <ellipse cx="1100" cy="760" rx="300" ry="240" fill="url(#rg-peach)" />
            <ellipse cx="240"  cy="820" rx="260" ry="200" fill="url(#rg-butter)" />
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
            <a href="#" style={{ fontSize: 13, color: 'var(--ink-3)', padding: '8px 14px', textDecoration: 'none', borderRadius: 999, fontWeight: 500 }}>Docs</a>
            <ThemeToggle />
            <NewProjectButton userId={userId} />
            <UserButton />
          </div>
        </nav>

        {/* Main */}
        <main style={{ maxWidth: 1120, margin: '0 auto', padding: '48px 40px 80px' }}>
          <div style={{ marginBottom: 36 }}>
            <h1 className="serif" style={{ fontWeight: 400, fontSize: 52, margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1 }}>
              Your <em style={{ fontStyle: 'italic', color: 'var(--ac)' }}>projects</em>
            </h1>
            <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0 }}>
              {count > 0 ? `${count} prototype${count !== 1 ? 's' : ''} · last edited today` : 'No projects yet'}
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
            {projects && projects.map((project, i) => {
              const t = THUMB_PATTERNS[i % 6];
              return (
                <div key={project.id} className="group" style={{ position: 'relative' }}>
                  <Link
                    href={`/app/${project.id}`}
                    style={{ textDecoration: 'none', display: 'block', background: 'var(--paper)', border: '1px solid var(--rule)', borderRadius: 18, overflow: 'hidden', transition: 'transform 200ms ease, box-shadow 200ms ease', cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow-card)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.transform = '';
                      (e.currentTarget as HTMLAnchorElement).style.boxShadow = '';
                    }}
                  >
                    {/* Watercolor thumbnail */}
                    <div style={{ height: 150, position: 'relative', overflow: 'hidden' }}>
                      <svg viewBox="0 0 320 150" preserveAspectRatio="xMidYMid slice" style={{ width: '100%', height: '100%', display: 'block' }}>
                        <rect width="320" height="150" fill="var(--paper-2)" />
                        <g className="splash" filter="url(#watercolor-soft)">
                          <ellipse cx={t.e1.cx} cy={t.e1.cy} rx={t.e1.rx} ry={t.e1.ry} fill={`url(#${t.g1})`} />
                          <ellipse cx={t.e2.cx} cy={t.e2.cy} rx={t.e2.rx} ry={t.e2.ry} fill={`url(#${t.g2})`} />
                        </g>
                      </svg>
                    </div>
                    {/* Info */}
                    <div style={{ padding: '16px 18px 18px' }}>
                      <h2 className="serif" style={{ fontWeight: 400, fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.01em', color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {project.name}
                      </h2>
                      <div style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {new Date(project.updated_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </div>
                    </div>
                  </Link>
                  <DeleteProjectButton projectId={project.id} projectName={project.name} deleteAction={deleteProject} />
                </div>
              );
            })}

            {/* New project card */}
            <NewProjectCardButton userId={userId} />
          </div>

          {/* Empty state */}
          {(!projects || projects.length === 0) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', textAlign: 'center' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 24, fontFamily: 'var(--font-geist-mono)' }}>No projects yet — create your first prototype above.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function NewProjectButton({ userId }: { userId: string }) {
  async function createProject() {
    'use server';
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .insert({ user_id: userId, name: 'Untitled Project' })
      .select('id')
      .single();
    if (data?.id) redirect(`/app/${data.id}`);
  }

  return (
    <form action={createProject}>
      <button type="submit" className="btn-wc-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
        + New project
      </button>
    </form>
  );
}

function NewProjectCardButton({ userId }: { userId: string }) {
  async function createProject() {
    'use server';
    const supabase = await createClient();
    const { data } = await supabase
      .from('projects')
      .insert({ user_id: userId, name: 'Untitled Project' })
      .select('id')
      .single();
    if (data?.id) redirect(`/app/${data.id}`);
  }

  return (
    <form action={createProject} style={{ display: 'contents' }}>
      <button
        type="submit"
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 236, border: '1.5px dashed var(--rule-2)', borderRadius: 18, color: 'var(--ink-3)', gap: 10, background: 'transparent', width: '100%', cursor: 'pointer', transition: 'all 200ms ease' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--ac)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ac)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--ac-bg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--rule-2)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-3)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
      >
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--ac-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ac)', fontSize: 22, fontWeight: 300 }}>+</div>
        <div className="serif" style={{ fontStyle: 'italic', fontSize: 20 }}>Start something new</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-geist-mono)' }}>⌘ N</div>
      </button>
    </form>
  );
}
