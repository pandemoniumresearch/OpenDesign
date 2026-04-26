import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { ingestFromFigma } from '@/lib/ingestion/from-figma';
import { createClient } from '@/lib/supabase/server';
import { decrypt } from '@/lib/encryption';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { url?: string; projectId?: string; figmaToken?: string };
  const { url, projectId, figmaToken: inlineToken } = body;

  if (!url || !projectId) {
    return NextResponse.json({ error: 'url and projectId are required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Prefer stored token, then inline token passed from the panel, then server env
  const { data: keyRow } = await supabase
    .from('user_api_keys')
    .select('figma_key')
    .eq('user_id', userId)
    .single();

  const storedToken = keyRow?.figma_key
    ? (() => { try { return decrypt(keyRow.figma_key); } catch { return null; } })()
    : null;

  const token = storedToken ?? inlineToken ?? process.env.FIGMA_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: 'No Figma token found. Add one in Settings → API Keys.' },
      { status: 400 },
    );
  }

  try {
    const brandContext = await ingestFromFigma(url, token);

    await supabase
      .from('projects')
      .update({ brand_context: brandContext })
      .eq('id', projectId)
      .eq('user_id', userId);

    return NextResponse.json({ brandContext });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Figma ingestion failed';
    console.error('Figma ingest error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
