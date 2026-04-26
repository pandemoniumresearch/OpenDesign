import type { BrandContext } from './from-url';

interface FigmaColor { r: number; g: number; b: number; a: number; }
interface FigmaFill { type: string; color?: FigmaColor; opacity?: number; }
interface FigmaTypeStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: number;
  lineHeightPx?: number;
}
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  fills?: FigmaFill[];
  style?: FigmaTypeStyle;
  children?: FigmaNode[];
}
interface FigmaFileResponse {
  name: string;
  document: FigmaNode;
}

function figmaColorToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function extractFileKey(url: string): string {
  const match = url.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (!match) throw new Error('Invalid Figma URL — expected https://www.figma.com/file/... or /design/...');
  return match[1];
}

function collectFromNodes(
  nodes: FigmaNode[],
  colors: Set<string>,
  fonts: Set<string>,
  fontSizes: Set<string>,
  depth = 0,
) {
  if (depth > 6) return;
  for (const node of nodes) {
    if (node.fills) {
      for (const fill of node.fills) {
        if (fill.type === 'SOLID' && fill.color) {
          colors.add(figmaColorToHex(fill.color.r, fill.color.g, fill.color.b));
        }
      }
    }
    if (node.style?.fontFamily) fonts.add(node.style.fontFamily);
    if (node.style?.fontSize) fontSizes.add(`${node.style.fontSize}px`);
    if (node.children) collectFromNodes(node.children, colors, fonts, fontSizes, depth + 1);
  }
}

export async function ingestFromFigma(figmaUrl: string, figmaToken: string): Promise<BrandContext> {
  const fileKey = extractFileKey(figmaUrl);

  const res = await fetch(`https://api.figma.com/v1/files/${fileKey}?depth=4`, {
    headers: { 'X-Figma-Token': figmaToken },
    signal: AbortSignal.timeout(25_000),
  });

  if (!res.ok) {
    if (res.status === 403) throw new Error('Invalid Figma token or file is not accessible to this token');
    if (res.status === 404) throw new Error('Figma file not found — check the URL and token permissions');
    throw new Error(`Figma API error: ${res.status}`);
  }

  const data = await res.json() as FigmaFileResponse;

  const colors = new Set<string>();
  const fonts = new Set<string>();
  const fontSizes = new Set<string>();

  if (data.document?.children) {
    collectFromNodes(data.document.children, colors, fonts, fontSizes);
  }

  const colorArray = [...colors].slice(0, 12);
  const fontArray = [...fonts].slice(0, 4);
  const fontSizeArray = [...fontSizes].slice(0, 8);

  const brandContextString = [
    `Source: ${figmaUrl}`,
    `File: ${data.name}`,
    colorArray.length > 0 ? `Colors: ${colorArray.join(', ')}` : '',
    fontArray.length > 0 ? `Font families: ${fontArray.join(', ')}` : '',
    fontSizeArray.length > 0 ? `Font sizes: ${fontSizeArray.join(', ')}` : '',
  ].filter(Boolean).join('\n');

  return {
    sourceUrl: figmaUrl,
    colors: colorArray,
    fontFamilies: fontArray,
    fontSizes: fontSizeArray,
    rawCss: '',
    dtcgTokens: {},
    brandContextString,
  };
}
