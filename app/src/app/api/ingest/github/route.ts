import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ingestFromGithub } from '@/lib/ingestion/from-github';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { url, projectId } = await req.json() as { url: string; projectId: string };
  if (!url || !projectId) {
    return NextResponse.json({ error: 'url and projectId are required' }, { status: 400 });
  }

  try {
    const brandContext = await ingestFromGithub(url);

    const supabase = await createClient();
    await supabase
      .from('projects')
      .update({ brand_context: brandContext })
      .eq('id', projectId);

    return NextResponse.json({ brandContext });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'GitHub ingestion failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
