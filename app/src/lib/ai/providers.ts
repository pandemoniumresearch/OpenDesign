import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';
import type { LanguageModel } from 'ai';

export type Provider = 'anthropic' | 'openai' | 'gemini';

export const PROVIDER_MODELS: Record<Provider, string> = {
  anthropic: 'claude-sonnet-4-6',
  openai: 'gpt-4o',
  gemini: 'gemini-2.0-flash',
};

export function getModel(provider: Provider = 'anthropic'): LanguageModel {
  switch (provider) {
    case 'openai':
      return openai(PROVIDER_MODELS.openai);
    case 'gemini':
      return google(PROVIDER_MODELS.gemini);
    case 'anthropic':
    default:
      return anthropic(PROVIDER_MODELS.anthropic);
  }
}
