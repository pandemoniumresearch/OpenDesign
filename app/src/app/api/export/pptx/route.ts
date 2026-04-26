import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { exportPptx } from '@/lib/export/pptx';
import { createClient } from '@/lib/supabase/server';
import type { Deck } from '@/lib/ai/generate-deck';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { deck, artifactId } = await req.json() as { deck: Deck; artifactId?: string };

  if (!deck) {
    return NextResponse.json({ error: 'deck is required' }, { status: 400 });
  }

  const supabase = await createClient();
  let exportId: string | undefined;

  if (artifactId) {
    const { data } = await supabase
      .from('exports')
      .insert({ artifact_id: artifactId, format: 'pptx', status: 'processing' })
      .select('id').single();
    exportId = data?.id;
  }

  try {
    const buffer = await exportPptx(deck);
    const slug = deck.title.replace(/[^a-z0-9]/gi, '-').toLowerCase();

    if (exportId) {
      await supabase.from('exports').update({ status: 'done' }).eq('id', exportId);
    }

    return new NextResponse(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${slug}.pptx"`,
      },
    });
  } catch (err: unknown) {
    if (exportId) {
      const message = err instanceof Error ? err.message : 'Export failed';
      await supabase.from('exports').update({ status: 'error', error_message: message }).eq('id', exportId);
    }
    throw err;
  }
}
