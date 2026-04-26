import { generatePrototype, buildFullHtml } from '@/lib/ai/generate-prototype';
import type { Prototype } from '@/lib/ai/generate-prototype';
import { generateDeck, buildDeckHtml } from '@/lib/ai/generate-deck';
import type { Deck } from '@/lib/ai/generate-deck';
import { generateLandingPage, buildLandingHtml } from '@/lib/ai/generate-landing';
import type { LandingPage } from '@/lib/ai/generate-landing';
import type { Provider, UserApiKeys } from '@/lib/ai/providers';

export type ArtifactType = 'prototype' | 'deck' | 'landing';

export interface GenerateArtifactOptions {
  type: ArtifactType;
  prompt: string;
  brandContextString?: string;
  provider?: Provider;
  userKeys?: UserApiKeys;
}

export type ArtifactResult =
  | { type: 'prototype'; prototype: Prototype; fullHtml: string }
  | { type: 'deck'; deck: Deck; fullHtml: string }
  | { type: 'landing'; landingPage: LandingPage; fullHtml: string };

export async function generateArtifact(options: GenerateArtifactOptions): Promise<ArtifactResult> {
  const { type, prompt, brandContextString, provider, userKeys } = options;

  if (type === 'deck') {
    const deck = await generateDeck({ prompt, brandContext: brandContextString, provider, userKeys });
    const fullHtml = buildDeckHtml(deck);
    return { type: 'deck', deck, fullHtml };
  }

  if (type === 'landing') {
    const landingPage = await generateLandingPage({ prompt, brandContext: brandContextString, provider, userKeys });
    const fullHtml = buildLandingHtml(landingPage);
    return { type: 'landing', landingPage, fullHtml };
  }

  const prototype = await generatePrototype({ prompt, brandContext: brandContextString, provider, userKeys });
  const fullHtml = buildFullHtml(prototype);
  return { type: 'prototype', prototype, fullHtml };
}

/** Generate prototype + deck in parallel from a single prompt (multi-artifact orchestration). */
export async function generateAll(options: Omit<GenerateArtifactOptions, 'type'>): Promise<{
  prototype: ArtifactResult & { type: 'prototype' };
  deck: ArtifactResult & { type: 'deck' };
}> {
  const [protoResult, deckResult] = await Promise.all([
    generateArtifact({ ...options, type: 'prototype' }),
    generateArtifact({ ...options, type: 'deck' }),
  ]);
  return {
    prototype: protoResult as ArtifactResult & { type: 'prototype' },
    deck: deckResult as ArtifactResult & { type: 'deck' },
  };
}
