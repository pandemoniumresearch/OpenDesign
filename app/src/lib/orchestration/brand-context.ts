import type { BrandContext } from '@/lib/ingestion/from-url';

export interface BrandContextBundle {
  tokens: BrandContext['dtcgTokens'];
  brandContextString: string;
  // Phase 2: populated from GitHub repo / Storybook ingestion
  componentCard: Record<string, unknown>;
}

export function extractBrandContextBundle(brandContext: BrandContext): BrandContextBundle {
  return {
    tokens: brandContext.dtcgTokens,
    brandContextString: brandContext.brandContextString,
    componentCard: {},
  };
}
