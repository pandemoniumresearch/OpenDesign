import type { Deck } from '@/lib/ai/generate-deck';

function hexNoHash(hex: string): string {
  return hex.replace(/^#/, '').toUpperCase();
}

export async function exportPptx(deck: Deck): Promise<Buffer> {
  // Dynamic import - pptxgenjs is CJS; avoids Edge runtime issues
  const { default: PptxGenJS } = await import('pptxgenjs');

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; // 13.33" × 7.5" (16:9)

  const bg = hexNoHash(deck.colorBackground);
  const textColor = hexNoHash(deck.colorText);
  const accentColor = hexNoHash(deck.colorAccent);
  const font = deck.fontFamily.split(',')[0].replace(/["']/g, '').trim();

  for (let i = 0; i < deck.slides.length; i++) {
    const slideData = deck.slides[i];
    const s = pres.addSlide();
    s.background = { color: bg };

    const isTitle = slideData.layout === 'title-slide';
    const isSection = slideData.layout === 'section';

    if (isTitle) {
      // Slide number
      s.addText(`${i + 1} / ${deck.slides.length}`, {
        x: 11.5, y: 0.2, w: 1.6, h: 0.3,
        fontSize: 9, color: textColor, fontFace: font,
        align: 'right', transparency: 60,
      });

      // Main title
      s.addText(deck.title, {
        x: 0.7, y: 1.8, w: 11.0, h: 2.5,
        fontSize: 48, bold: true, color: accentColor, fontFace: font,
        align: 'left', charSpacing: -1,
      });

      // Subtitle
      s.addText(deck.subtitle, {
        x: 0.7, y: 4.4, w: 8.0, h: 1.2,
        fontSize: 20, color: textColor, fontFace: font,
        align: 'left', transparency: 35,
      });

      // Accent bar
      s.addShape('rect', {
        x: 0.7, y: 1.55, w: 0.06, h: 2.8,
        fill: { color: accentColor },
        line: { type: 'none' },
      });
    } else if (isSection) {
      s.addText(`${i + 1} / ${deck.slides.length}`, {
        x: 11.5, y: 0.2, w: 1.6, h: 0.3,
        fontSize: 9, color: textColor, fontFace: font,
        align: 'right', transparency: 60,
      });

      s.addText(slideData.title, {
        x: 0.9, y: 2.5, w: 11.0, h: 2.5,
        fontSize: 38, bold: true, color: accentColor, fontFace: font,
        align: 'left', charSpacing: -1,
      });
    } else {
      // Content / closing
      s.addText(`${i + 1} / ${deck.slides.length}`, {
        x: 11.5, y: 0.2, w: 1.6, h: 0.3,
        fontSize: 9, color: textColor, fontFace: font,
        align: 'right', transparency: 60,
      });

      // Title
      s.addText(slideData.title, {
        x: 0.7, y: 0.5, w: 11.6, h: 1.2,
        fontSize: 28, bold: true, color: accentColor, fontFace: font,
        align: 'left', charSpacing: -0.5,
      });

      // Horizontal rule
      s.addShape('rect', {
        x: 0.7, y: 1.65, w: 11.6, h: 0.02,
        fill: { color: accentColor, transparency: 75 },
        line: { type: 'none' },
      });

      // Bullets
      if (slideData.bullets.length > 0) {
        const bulletItems = slideData.bullets.map((b) => ({
          text: b,
          options: { bullet: { type: 'bullet' as const }, paraSpaceAfter: 10 },
        }));

        s.addText(bulletItems, {
          x: 0.7, y: 1.9, w: 11.6, h: 4.8,
          fontSize: 18, color: textColor, fontFace: font,
          lineSpacingMultiple: 1.5, valign: 'top',
        });
      }
    }

    // Speaker notes
    if (slideData.speakerNotes) {
      s.addNotes(slideData.speakerNotes);
    }
  }

  return await pres.write({ outputType: 'nodebuffer' }) as unknown as Buffer;
}
