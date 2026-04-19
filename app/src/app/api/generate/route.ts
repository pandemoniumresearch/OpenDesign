import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { generatePrototype, buildFullHtml } from '@/lib/ai/generate-prototype';
import { createClient } from '@/lib/supabase/server';
import type { Provider } from '@/lib/ai/providers';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { prompt, projectId, provider, brandContext } = body as {
    prompt: string;
    projectId: string;
    provider?: Provider;
    brandContext?: string;
  };

  if (!prompt || !projectId) {
    return NextResponse.json({ error: 'prompt and projectId are required' }, { status: 400 });
  }

  try {
    const prototype = await generatePrototype({ prompt, provider, brandContext });
    const fullHtml = buildFullHtml(prototype);

    // Persist artifact to Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('artifacts')
      .insert({
        project_id: projectId,
        type: 'prototype',
        document: { ...prototype, fullHtml, prompt },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      // Return result even if DB save fails — don't block the user
    }

    return NextResponse.json({ prototype, fullHtml, artifactId: data?.id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Generation failed';
    console.error('Generate error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
