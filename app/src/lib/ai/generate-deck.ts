import { generateObject } from 'ai';
import { z } from 'zod';
import { getModel, type Provider, type UserApiKeys } from './providers';

// Flat schema - avoids anyOf/discriminated unions that Gemini rejects
export const SlideSchema = z.object({
  title: z.string().describe('Slide title (under 8 words)'),
  bullets: z.array(z.string()).describe('3-5 bullet points, each under 12 words'),
  speakerNotes: z.string().describe('1-2 sentence speaker note for this slide'),
  layout: z.enum(['title-slide', 'section', 'content', 'closing']).describe('Slide layout type'),
});

export const DeckSchema = z.object({
  title: z.string().describe('Presentation title'),
  subtitle: z.string().describe('Tagline or purpose statement (1 sentence)'),
  colorBackground: z.string().describe('Background color hex e.g. #1e293b'),
  colorText: z.string().describe('Body text color hex e.g. #f8fafc'),
  colorAccent: z.string().describe('Accent/heading color hex e.g. #6366f1'),
  fontFamily: z.string().describe('Font family string e.g. "Inter, sans-serif"'),
  slides: z.array(SlideSchema).min(4).max(12),
});

export type Deck = z.infer<typeof DeckSchema>;
export type Slide = z.infer<typeof SlideSchema>;

const SYSTEM_PROMPT = `You are an expert presentation designer. Generate professional, concise slide decks.
Each slide should have a clear title and 3-5 focused bullet points (under 12 words each).
Design with modern, clean aesthetics. Dark themes by default.
Speaker notes should add context not visible on the slide.
First slide must be layout "title-slide", last must be "closing".`;

export async function generateDeck({
  prompt,
  brandContext,
  provider = 'anthropic',
  userKeys,
}: {
  prompt: string;
  brandContext?: string;
  provider?: Provider;
  userKeys?: UserApiKeys;
}): Promise<Deck> {
  const model = getModel(provider, userKeys);

  const systemWithBrand = brandContext
    ? `${SYSTEM_PROMPT}\n\nBrand design tokens to apply:\n${brandContext}`
    : SYSTEM_PROMPT;

  const { object } = await generateObject({
    model,
    schema: DeckSchema,
    system: systemWithBrand,
    prompt: `Create a presentation deck about: ${prompt}`,
  });

  return object;
}

export function buildDeckHtml(deck: Deck): string {
  const bg = deck.colorBackground;
  const text = deck.colorText;
  const accent = deck.colorAccent;
  const font = deck.fontFamily;

  const slideHtml = deck.slides.map((slide, i) => {
    const isTitle = slide.layout === 'title-slide';
    const isSection = slide.layout === 'section';
    const isClosing = slide.layout === 'closing';
    const bullets = slide.bullets.map((b) => `<li>${b}</li>`).join('');

    if (isTitle) {
      return `
      <section class="slide">
        <div class="slide-number">${i + 1} / ${deck.slides.length}</div>
        <h1 class="slide-title-main">${deck.title}</h1>
        <p class="slide-subtitle">${deck.subtitle}</p>
      </section>`;
    }
    if (isSection) {
      return `
      <section class="slide slide-section">
        <div class="slide-number">${i + 1} / ${deck.slides.length}</div>
        <h2 class="slide-section-title">${slide.title}</h2>
      </section>`;
    }
    if (isClosing) {
      return `
      <section class="slide slide-closing">
        <div class="slide-number">${i + 1} / ${deck.slides.length}</div>
        <h2 class="slide-title">${slide.title}</h2>
        <ul class="slide-bullets">${bullets}</ul>
      </section>`;
    }
    return `
    <section class="slide">
      <div class="slide-number">${i + 1} / ${deck.slides.length}</div>
      <h2 class="slide-title">${slide.title}</h2>
      <ul class="slide-bullets">${bullets}</ul>
    </section>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${deck.title}</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-snap-type: y mandatory; overflow-y: scroll; height: 100%; }
body {
  font-family: ${font};
  background: ${bg};
  color: ${text};
  height: 100%;
}
.slide {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 64px 80px;
  scroll-snap-align: start;
  position: relative;
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.slide-section {
  background: color-mix(in srgb, ${accent} 12%, ${bg});
}
.slide-closing {
  background: color-mix(in srgb, ${accent} 8%, ${bg});
}
.slide-number {
  position: absolute;
  top: 24px;
  right: 32px;
  font-size: 11px;
  letter-spacing: 0.1em;
  opacity: 0.35;
  font-variant-numeric: tabular-nums;
}
.slide-title-main {
  font-size: clamp(36px, 5vw, 64px);
  font-weight: 700;
  color: ${accent};
  line-height: 1.1;
  letter-spacing: -0.03em;
  margin-bottom: 20px;
  max-width: 80%;
}
.slide-subtitle {
  font-size: clamp(16px, 2vw, 22px);
  opacity: 0.65;
  font-weight: 400;
  max-width: 60%;
  line-height: 1.5;
}
.slide-section-title {
  font-size: clamp(28px, 4vw, 52px);
  font-weight: 600;
  color: ${accent};
  letter-spacing: -0.02em;
  line-height: 1.15;
}
.slide-title {
  font-size: clamp(22px, 3vw, 38px);
  font-weight: 600;
  color: ${accent};
  letter-spacing: -0.02em;
  margin-bottom: 32px;
  line-height: 1.2;
}
.slide-bullets {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 80%;
}
.slide-bullets li {
  font-size: clamp(14px, 1.8vw, 20px);
  line-height: 1.5;
  padding-left: 20px;
  position: relative;
  opacity: 0.85;
}
.slide-bullets li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.6em;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${accent};
}
</style>
</head>
<body>
${slideHtml}
</body>
</html>`;
}
