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
        className="w-6 h-6 flex items-center justify-center rounded-md transition-colors text-xs"
        style={{ color: 'var(--t5)' }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--err)';
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--err-bg)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--t5)';
          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        }}
        onClick={(e) => {
          if (!confirm(`Delete "${projectName}"?`)) e.preventDefault();
        }}
      >
        ✕
      </button>
    </form>
  );
}
