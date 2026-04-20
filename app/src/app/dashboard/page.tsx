import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { UserButton } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { DeleteProjectButton } from './DeleteProjectButton';

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
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="border-b border-slate-800/60 px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-semibold text-white tracking-tight">OpenDesign</Link>
        <div className="flex items-center gap-4">
          <NewProjectButton userId={userId} />
          <UserButton />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-8 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">Your design prototypes</p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <Link
                  href={`/app/${project.id}`}
                  className="block p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-indigo-500/50 hover:bg-slate-900/80 transition-all"
                >
                  <div className="w-full h-24 rounded-lg bg-slate-800 mb-4 flex items-center justify-center">
                    <span className="text-slate-600 text-xs font-mono">prototype</span>
                  </div>
                  <h2 className="font-medium text-white truncate pr-6 text-sm">{project.name}</h2>
                  <p className="text-slate-600 text-xs mt-1">
                    {new Date(project.updated_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
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
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
              <span className="text-slate-600 text-2xl font-mono">◈</span>
            </div>
            <h3 className="text-white font-medium mb-2">No projects yet</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first prototype to get started.</p>
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
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors"
      >
        + New project
      </button>
    </form>
  );
}
