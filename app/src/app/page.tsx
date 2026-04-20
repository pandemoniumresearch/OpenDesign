import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const supabase = await createClient();
  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, updated_at')
    .order('updated_at', { ascending: false });

  async function deleteProject(formData: FormData) {
    'use server';
    const projectId = formData.get('projectId') as string;
    const supabase = await createClient();
    await supabase.from('projects').delete().eq('id', projectId);
    revalidatePath('/');
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">OpenDesign</h1>
            <p className="text-slate-400 mt-1">Model-agnostic · OSS · Video export</p>
          </div>
          <NewProjectButton userId={userId} />
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="relative group">
                <Link href={`/app/${project.id}`}
                  className="block p-5 bg-slate-900 border border-slate-800 rounded-xl hover:border-indigo-500 transition-colors">
                  <h2 className="font-semibold text-white truncate pr-6">{project.name}</h2>
                  <p className="text-slate-500 text-sm mt-1">
                    {new Date(project.updated_at).toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </Link>
                <form action={deleteProject}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="hidden" name="projectId" value={project.id} />
                  <button
                    type="submit"
                    title="Delete project"
                    className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors text-xs"
                    onClick={(e) => {
                      if (!confirm(`Delete "${project.name}"? This cannot be undone.`)) e.preventDefault();
                    }}
                  >
                    ✕
                  </button>
                </form>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-slate-500">
            <p className="text-lg mb-2">No projects yet.</p>
            <p>Create your first project to get started.</p>
          </div>
        )}
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
      <button type="submit"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors">
        + New Project
      </button>
    </form>
  );
}
