import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/encryption';

export const runtime = 'nodejs';

function maskKey(decrypted: string): string {
  return decrypted.length <= 4 ? '••••' : `••••••••${decrypted.slice(-4)}`;
}

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const supabase = await createClient();
  const { data } = await supabase
    .from('user_api_keys')
    .select('anthropic_key, openai_key, google_key, figma_key')
    .eq('user_id', userId)
    .single();

  const decode = (enc: string | null | undefined) => {
    if (!enc) return { isSet: false };
    try {
      const plain = decrypt(enc);
      return { isSet: true, masked: maskKey(plain) };
    } catch {
      return { isSet: false };
    }
  };

  return NextResponse.json({
    anthropic: decode(data?.anthropic_key),
    openai:    decode(data?.openai_key),
    google:    decode(data?.google_key),
    figma:     decode(data?.figma_key),
  });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as {
    anthropic?: string | null;
    openai?: string | null;
    google?: string | null;
    figma?: string | null;
  };

  const update: Record<string, string | null> = {};

  for (const [field, envKey] of [
    ['anthropic', 'anthropic_key'],
    ['openai', 'openai_key'],
    ['google', 'google_key'],
    ['figma', 'figma_key'],
  ] as const) {
    if (field in body) {
      const val = body[field];
      update[envKey] = val ? encrypt(val.trim()) : null;
    }
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('user_api_keys')
    .upsert({ user_id: userId, ...update, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });

  if (error) {
    console.error('user_api_keys upsert error:', error);
    return NextResponse.json({ error: 'Failed to save key' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
