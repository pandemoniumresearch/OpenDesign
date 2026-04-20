import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserButton } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DeleteProjectButton } from './DeleteProjectButton';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-page)', color: 'var(--t1)' }}>
      {/* Header */}
      <header className="border-b px-8 h-14 flex items-center justify-between" style={{ borderColor: 'var(--bd-1)', background: 'var(--bg-panel)' }}>
        <Link href="/" className="flex items-center gap-1.5 no-underline">
          <span className="text-sm font-bold tracking-tight">
            <span style={{ color: 'var(--ac)' }}>Open</span>
            <span style={{ color: 'var(--t4)' }}>Design</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NewProjectButton userId={userId} />
          <UserButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-xl font-bold" style={{ color: 'var(--t1)' }}>Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--t4)' }}>Your design prototypes</p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project, i) => (
              <div key={project.id} className="relative group">
                <Link
                  href={`/app/${project.id}`}
                  className="block rounded-2xl overflow-hidden transition-all"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--bd-1)' }}
                >
                  {/* Thumbnail */}
                  <div
                    className="w-full h-28 opacity-90 group-hover:opacity-100 transition-opacity"
                    style={{ background: `var(--thumb-${(i % 6) + 1})` }}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.4">
                        <path d="M16 4L19 12H27L21 17L23 25L16 20L9 25L11 17L5 12H13L16 4Z" fill="white" />
                      </svg>
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4">
                    <h2 className="font-medium truncate pr-6 text-sm transition-colors" style={{ color: 'var(--t1)' }}>
                      {project.name}
                    </h2>
                    <p className="text-xs mt-1" style={{ color: 'var(--t5)' }}>
                      {new Date(project.updated_at).toLocaleDateString(undefined, {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </p>
                  </div>
                </Link>
                <DeleteProjectButton
                  projectId={project.id}
                  projectName={project.name}
                  deleteAction={deleteProject}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: 'var(--bg-panel)', border: '1px solid var(--bd-1)' }}>
              <span className="text-2xl font-mono" style={{ color: 'var(--t5)' }}>◈</span>
            </div>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--t1)' }}>No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--t4)' }}>Create your first prototype to get started.</p>
            <NewProjectButton userId={userId} />
          </div>
        )}
      </main>
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
      <button
        type="submit"
        className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 text-white"
        style={{ background: 'var(--ac)' }}
      >
        <span className="text-base leading-none mb-px">+</span>
        New project
      </button>
    </form>
  );
}
