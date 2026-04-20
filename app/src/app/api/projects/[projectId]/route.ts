import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

interface Props {
  params: Promise<{ projectId: string }>;
}

export async function PATCH(req: NextRequest, { params }: Props) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const { name } = await req.json() as { name: string };
  if (!name?.trim()) return NextResponse.json({ error: 'name is required' }, { status: 400 });

  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .update({ name: name.trim() })
    .eq('id', projectId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Props) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
