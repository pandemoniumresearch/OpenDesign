'use client';

interface DeleteProjectButtonProps {
  projectId: string;
  projectName: string;
  deleteAction: (formData: FormData) => Promise<void>;
}

export function DeleteProjectButton({ projectId, projectName, deleteAction }: DeleteProjectButtonProps) {
  return (
    <form
      action={deleteAction}
      className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <button
        type="submit"
        title="Delete project"
        className="w-6 h-6 flex items-center justify-center rounded-md text-slate-600 hover:text-red-400 hover:bg-slate-800 transition-colors text-xs"
        onClick={(e) => {
          if (!confirm(`Delete "${projectName}"?`)) e.preventDefault();
        }}
      >
        ✕
      </button>
    </form>
  );
}
