import { generatePrototype, buildFullHtml } from '@/lib/ai/generate-prototype';
import type { Prototype } from '@/lib/ai/generate-prototype';
import type { Provider } from '@/lib/ai/providers';

// Phase 1: prototype only. Phase 2 adds: 'deck' | 'landing-page'
export type ArtifactType = 'prototype';

export interface GenerateArtifactOptions {
  type: ArtifactType;
  prompt: string;
  brandContextString?: string;
  provider?: Provider;
}

export interface ArtifactResult {
  type: ArtifactType;
  prototype: Prototype;
  fullHtml: string;
}

export async function generateArtifact(options: GenerateArtifactOptions): Promise<ArtifactResult> {
  const { type, prompt, brandContextString, provider } = options;

  if (type !== 'prototype') {
    throw new Error(`Artifact type "${type}" not yet supported — coming in Phase 2`);
  }

  const prototype = await generatePrototype({ prompt, brandContext: brandContextString, provider });
  const fullHtml = buildFullHtml(prototype);
  return { type, prototype, fullHtml };
}
