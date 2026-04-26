import { css_to_tokens } from '@projectwallace/css-design-tokens';
import type { BrandContext } from './from-url';

interface GithubFile {
  path: string;
  type: string;
  url?: string;
}

interface DtcgToken {
  $type: string;
  $value: unknown;
  $extensions?: Record<string, unknown>;
}

const TARGET_PATTERNS = [
  /globals?\.css$/i,
  /variables?\.css$/i,
  /tokens?\.css$/i,
  /design-tokens?\.css$/i,
  /styles\/index\.css$/i,
  /src\/styles.*\.css$/i,
  /app\/globals\.css$/i,
  /theme\.(css|scss)$/i,
  /tailwind\.config\.[jt]sx?$/i,
  /tokens?\.(json|js|ts)$/i,
];

function githubHeaders() {
  const h: Record<string, string> = { Accept: 'application/vnd.github.v3+json' };
  if (process.env.GITHUB_TOKEN) h.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  return h;
}

function extractCssVarColors(css: string): string[] {
  const colors: string[] = [];
  const re = /--[\w-]*(?:color|bg|background|accent|primary|secondary|foreground)[\w-]*\s*:\s*(#[0-9a-fA-F]{3,8})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) colors.push(m[1].toLowerCase());
  return [...new Set(colors)].slice(0, 12);
}

function extractTailwindColors(config: string): string[] {
  const colors: string[] = [];
  const re = /#[0-9a-fA-F]{3,8}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(config)) !== null) colors.push(m[0].toLowerCase());
  return [...new Set(colors)].slice(0, 12);
}

function extractFontFamilies(css: string): string[] {
  const families: string[] = [];
  const re = /font-family\s*:\s*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) families.push(m[1].trim());
  return [...new Set(families)].slice(0, 4);
}

function extractFontSizes(css: string): string[] {
  const sizes: string[] = [];
  const re = /--[\w-]*(?:font-size|text-size|fs)[\w-]*\s*:\s*([^;{}]+)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) sizes.push(m[1].trim());
  return [...new Set(sizes)].slice(0, 8);
}

export async function ingestFromGithub(repoUrl: string): Promise<BrandContext> {
  const match = repoUrl.match(/github\.com\/([^/]+)\/([^/#?]+)/);
  if (!match) throw new Error('Invalid GitHub URL. Expected https://github.com/owner/repo');

  const [, owner, repo] = match;
  const apiBase = `https://api.github.com/repos/${owner}/${repo}`;

  // Get default branch
  const repoRes = await fetch(apiBase, {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(10_000),
  });
  if (!repoRes.ok) {
    if (repoRes.status === 404) throw new Error(`Repository ${owner}/${repo} not found or private`);
    throw new Error(`GitHub API error: ${repoRes.status}`);
  }
  const repoData = await repoRes.json() as { default_branch: string };
  const branch = repoData.default_branch;

  // Get file tree (recursive)
  const treeRes = await fetch(`${apiBase}/git/trees/${branch}?recursive=1`, {
    headers: githubHeaders(),
    signal: AbortSignal.timeout(15_000),
  });
  if (!treeRes.ok) throw new Error(`Could not fetch file tree: ${treeRes.status}`);
  const treeData = await treeRes.json() as { tree: GithubFile[] };

  // Filter relevant files
  const files = (treeData.tree ?? [])
    .filter((f) => f.type === 'blob' && TARGET_PATTERNS.some((p) => p.test(f.path)))
    .slice(0, 12);

  if (files.length === 0) {
    throw new Error(`No design token files found in ${owner}/${repo}. Try a repo with globals.css or tailwind.config.`);
  }

  // Fetch raw file contents
  const rawBase = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;
  const contents = await Promise.allSettled(
    files.map(async (f) => {
      const res = await fetch(`${rawBase}/${f.path}`, {
        headers: { 'User-Agent': 'OpenDesign/1.0' },
        signal: AbortSignal.timeout(10_000),
      });
      return res.ok ? { path: f.path, content: await res.text() } : null;
    })
  );

  const fetched = contents
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter(Boolean) as { path: string; content: string }[];

  const cssFiles = fetched.filter((f) => f.path.endsWith('.css'));
  const configFiles = fetched.filter((f) => !f.path.endsWith('.css'));

  const allCss = cssFiles.map((f) => f.content).join('\n');
  const allConfig = configFiles.map((f) => f.content).join('\n');

  // Parse DTCG tokens from CSS
  const dtcgTokens = css_to_tokens(allCss) as unknown as Record<string, Record<string, DtcgToken>>;

  // Extract colors from CSS vars + Tailwind config
  const cssColors = extractCssVarColors(allCss);
  const twColors = extractTailwindColors(allConfig);
  const colors = [...new Set([...cssColors, ...twColors])].slice(0, 12);

  const fontFamilies = extractFontFamilies(allCss);
  const fontSizes = extractFontSizes(allCss);

  const brandContextString = [
    `Source: github.com/${owner}/${repo}`,
    colors.length > 0 ? `Colors: ${colors.join(', ')}` : '',
    fontFamilies.length > 0 ? `Font families: ${fontFamilies.join(', ')}` : '',
    fontSizes.length > 0 ? `Font sizes: ${fontSizes.join(', ')}` : '',
    `Files parsed: ${fetched.map((f) => f.path).join(', ')}`,
  ].filter(Boolean).join('\n');

  return {
    sourceUrl: `https://github.com/${owner}/${repo}`,
    colors,
    fontFamilies,
    fontSizes,
    rawCss: allCss.slice(0, 5000),
    dtcgTokens,
    brandContextString,
  };
}
