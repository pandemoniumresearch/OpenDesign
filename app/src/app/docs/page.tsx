import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';
import { DocsSidebar } from './DocsSidebar';
import type { Metadata } from 'next';
import type { ReactNode, CSSProperties } from 'react';

export const metadata: Metadata = {
  title: 'Documentation | OpenDesign',
  description: 'Learn how to generate prototypes, decks, and landing pages with AI using OpenDesign.',
};

export default function DocsPage() {
  return (
    <div
      className="grain-stage"
      style={{ minHeight: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}
    >
      {/* Watercolor splash */}
      <div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 1440 1600"
          preserveAspectRatio="xMidYMin slice"
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <g className="splash" filter="url(#watercolor-blur)">
            <ellipse cx="180"  cy="200"  rx="280" ry="220" fill="url(#rg-lav)" />
            <ellipse cx="1300" cy="160"  rx="300" ry="240" fill="url(#rg-mint)" />
            <ellipse cx="1200" cy="1100" rx="260" ry="220" fill="url(#rg-peach)" />
            <ellipse cx="160"  cy="1380" rx="240" ry="200" fill="url(#rg-butter)" />
          </g>
          <g className="splash" filter="url(#watercolor-soft)">
            <circle cx="440"  cy="380" r="40" fill="url(#rg-rose)" />
            <circle cx="1060" cy="300" r="30" fill="url(#rg-sky)" />
          </g>
        </svg>
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Nav */}
        <nav style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 48px', height: 56, borderBottom: '1px solid var(--rule)',
        }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: 'var(--ac)', marginRight: 8, boxShadow: '0 0 12px var(--ac-soft)',
            }} />
            <span className="serif" style={{
              fontStyle: 'italic', fontWeight: 400, fontSize: 20,
              color: 'var(--ac)', letterSpacing: '-0.01em', marginRight: 1,
            }}>Open</span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--ink)' }}>Design</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <NavLink href="/docs" active>Docs</NavLink>
            <NavLink href="https://github.com/Pandemonium-Research/OpenDesign">GitHub</NavLink>
            <NavLink href="/sign-in">Sign in</NavLink>
            <ThemeToggle />
            <Link href="/sign-up" className="btn-wc-primary" style={{ fontSize: 13, padding: '9px 18px' }}>
              Get started →
            </Link>
          </div>
        </nav>

        {/* Page hero */}
        <div style={{ padding: '56px 48px 28px', maxWidth: 1150, margin: '0 auto' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontSize: 12, fontWeight: 500, color: 'var(--ac)',
            padding: '6px 14px', borderRadius: 999,
            background: 'var(--ac-bg)', border: '1px solid rgba(122,104,200,0.2)',
            marginBottom: 20, letterSpacing: '-0.005em',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--ac)', display: 'inline-block' }} />
            Documentation
          </div>
          <h1 className="serif" style={{
            fontWeight: 400, fontSize: 'clamp(40px, 5vw, 64px)',
            lineHeight: 1.0, letterSpacing: '-0.025em',
            color: 'var(--ink)', margin: '0 0 14px',
          }}>
            Learn OpenDesign
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--ink-2)', maxWidth: 580, margin: 0 }}>
            Everything you need to know about generating prototypes, applying design tokens, and exporting production-ready artifacts.
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{
          display: 'flex', maxWidth: 1150, margin: '0 auto',
          padding: '24px 48px 80px', gap: 64, alignItems: 'flex-start',
        }}>
          <DocsSidebar />

          {/* Main content */}
          <article style={{ flex: 1, minWidth: 0 }}>

            {/* Overview */}
            <Section id="overview" title="Overview">
              <Prose>
                OpenDesign is an open-source, model-agnostic AI design tool. Write a prompt, pick
                your AI model, and get a fully self-contained HTML/CSS/JS artifact in seconds. Apply
                brand tokens from any website, GitHub repository, or Figma file, then export to
                HTML, PDF, MP4 video, PPTX, or hand the design off as a React, Vue, or Svelte
                component.
              </Prose>
              <Prose>
                OpenDesign is free to self-host. You bring your own API keys; there are no
                generation limits beyond what your model provider charges.
              </Prose>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '16px 0 0' }}>
                <ArtifactTypeItem
                  color="var(--ac)"
                  label="Prototype"
                  desc="A single-screen interactive HTML/CSS/JS mockup. Best for UI components, product layouts, and hero sections."
                />
                <ArtifactTypeItem
                  color="var(--sky)"
                  label="Deck"
                  desc="A multi-slide presentation. Each slide is a separate artboard with its own layout and design."
                />
                <ArtifactTypeItem
                  color="var(--ac3)"
                  label="Landing page"
                  desc="A full scrollable marketing page with hero, features, social proof, CTA, and footer."
                />
              </div>
            </Section>

            <Divider />

            {/* Getting started */}
            <Section id="getting-started" title="Getting started">
              <SubSection title="1. Create an account">
                <Prose>
                  Sign up at <Code>/sign-up</Code>. OpenDesign uses your own LLM API keys, so
                  there are no per-generation charges beyond what your model provider bills you.
                  The application itself is free.
                </Prose>
              </SubSection>

              <SubSection title="2. Create a project">
                <Prose>
                  From the dashboard, click <strong>New project</strong> and give it a name. A
                  project is a workspace that holds all the artifacts you generate. You can rename
                  it from inside the editor at any time.
                </Prose>
              </SubSection>

              <SubSection title="3. The editor layout">
                <Prose>The editor has three panels:</Prose>
                <InfoGrid items={[
                  {
                    label: 'Artifacts panel (left)',
                    desc: 'Lists every artifact you have generated in this project. Click any card to reload it into the canvas.',
                  },
                  {
                    label: 'Canvas (center)',
                    desc: 'Live preview of the active artifact. Toggle between the rendered Prototype view and the raw HTML/CSS/JS source with the Code tab.',
                  },
                  {
                    label: 'Controls (right)',
                    desc: 'Prompt input, AI model selector, brand token ingestor, and all export options.',
                  },
                ]} />
              </SubSection>

              <SubSection title="4. Add your API key">
                <Prose>
                  Go to <strong>Settings</strong> from the dashboard and paste your API key for at
                  least one LLM provider. You can also enter it inline using the provider selector
                  at the top of the editor controls panel without saving it to Settings.
                </Prose>
              </SubSection>
            </Section>

            <Divider />

            {/* Generating */}
            <Section id="generating" title="Generating">
              <SubSection title="Choosing an artifact type">
                <Prose>
                  Use the tab row at the top of the right panel to switch between{' '}
                  <strong>Prototype</strong>, <strong>Deck</strong>, and <strong>Landing</strong>{' '}
                  modes. Your choice changes the AI system prompt and the export options available.
                </Prose>
              </SubSection>

              <SubSection title="Prototypes">
                <Prose>
                  Describe the component or screen you want. Be specific about layout, color mood,
                  and interactions. The AI generates a single HTML/CSS/JS file.
                </Prose>
                <ExamplePrompts prompts={[
                  'A pricing table with three tiers, hover lift effect, and a badge on the Pro tier',
                  'A dark dashboard layout with a sidebar, chart area, and metric stat cards using glassmorphism',
                  'A minimal mobile checkout form with real-time field validation animations',
                ]} />
              </SubSection>

              <SubSection title="Slide decks">
                <Prose>
                  Describe the topic, audience, and tone. The AI generates a multi-slide structure.
                  Each slide is a separate styled artboard.
                </Prose>
                <ExamplePrompts prompts={[
                  'A 6-slide pitch deck for a B2B SaaS startup targeting enterprise HR teams, light professional style',
                  'A technical deep-dive on Rust ownership for senior engineers, dark minimal theme',
                ]} />
              </SubSection>

              <SubSection title="Landing pages">
                <Prose>
                  Describe the product or service. OpenDesign generates a complete marketing page
                  with all required sections: hero, features, social proof, CTA, and footer.
                </Prose>
                <ExamplePrompts prompts={[
                  'A landing page for a time-tracking app for freelancers, warm pastel color palette',
                  'An open-source developer tool for API mocking, dark minimal aesthetic, emphasis on speed',
                ]} />
              </SubSection>

              <SubSection title="Refine mode">
                <Prose>
                  After generating an artifact, check the <strong>Refine current design</strong>{' '}
                  toggle in the prompt panel. In refine mode your next prompt is applied as an
                  iteration on top of the existing output, not a fresh generation. The AI sees the
                  current HTML/CSS/JS and your instruction together.
                </Prose>
                <Prose>Good uses for refine mode:</Prose>
                <ul style={{ paddingLeft: 20, margin: '6px 0 0', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <li>Changing a color or font after seeing the initial result</li>
                  <li>Adding a new section to an existing landing page</li>
                  <li>Adjusting spacing or layout without losing the overall style</li>
                  <li>Fixing specific elements while keeping everything else intact</li>
                </ul>
              </SubSection>
            </Section>

            <Divider />

            {/* Design tokens */}
            <Section id="design-tokens" title="Design tokens">
              <Prose>
                The <strong>Brand Tokens</strong> panel (in the controls column) lets you pull
                design context from an existing source and inject it into every generation. The AI
                uses the extracted colors, fonts, and sizing as a guide when writing CSS.
              </Prose>
              <Prose>
                Apply tokens once per project session. They persist until you clear them or apply
                a new source.
              </Prose>

              <SubSection title="From a URL">
                <Prose>
                  Select the <strong>URL</strong> tab, paste any public website URL, and click{' '}
                  <strong>Fetch tokens</strong>. OpenDesign fetches the page HTML, parses all CSS
                  custom properties, and extracts colors, font families, and font sizes. The
                  extracted context is shown in a preview before you apply it.
                </Prose>
                <Note>
                  The target URL must be publicly accessible. Pages behind login walls or with
                  strict CORS or CSP headers may not parse correctly.
                </Note>
              </SubSection>

              <SubSection title="From a GitHub repository">
                <Prose>
                  Select the <strong>GitHub</strong> tab and paste a repo URL such as{' '}
                  <Code>https://github.com/owner/repo</Code>. OpenDesign traverses the repository
                  file tree and fetches design-relevant files automatically:
                </Prose>
                <ul style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 3, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <li><Code>globals.css</Code>, <Code>variables.css</Code>, <Code>tokens.css</Code></li>
                  <li><Code>tailwind.config.js</Code> and <Code>tailwind.config.ts</Code></li>
                  <li><Code>tokens.json</Code> and W3C DTCG-format token files</li>
                  <li>Any CSS file under <Code>src/styles/</Code> or matching <Code>design-tokens*</Code></li>
                </ul>
                <Note>
                  Add a <Code>GITHUB_TOKEN</Code> environment variable to your server to raise the
                  GitHub API rate limit from 60 to 5,000 requests per hour.
                </Note>
              </SubSection>

              <SubSection title="From Figma">
                <Prose>
                  Select the <strong>Figma</strong> tab, paste your Figma file URL, and enter a
                  personal access token. OpenDesign calls the Figma REST API, walks the document
                  tree up to 6 layers deep, and extracts SOLID fill colors and typography
                  (font families, sizes).
                </Prose>
                <Prose>
                  <strong>To create a Figma personal access token:</strong>
                </Prose>
                <ol style={{ paddingLeft: 20, margin: '8px 0', display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <li>Open Figma in your browser and click your avatar (top left)</li>
                  <li>Go to <strong>Settings</strong> then scroll to <strong>Personal access tokens</strong></li>
                  <li>Click <strong>Generate new token</strong>, give it a name, and copy it</li>
                </ol>
                <Note>
                  Save your Figma token permanently in{' '}
                  <Link href="/settings" style={{ color: 'var(--ac)', textDecoration: 'none' }}>Settings</Link>{' '}
                  so you do not need to re-enter it each time. The token is encrypted before storage.
                </Note>
              </SubSection>
            </Section>

            <Divider />

            {/* Exporting */}
            <Section id="exporting" title="Exporting">
              <Prose>
                The <strong>Export</strong> panel at the bottom of the right controls column
                offers multiple output formats. All exports are generated server-side.
              </Prose>

              <SubSection title="HTML bundle">
                <Prose>
                  Downloads a <Code>.zip</Code> containing a single self-contained{' '}
                  <Code>index.html</Code> file with all CSS and JavaScript inlined. Open it in any
                  browser, share it via email, or deploy it to any static host with no build step.
                </Prose>
              </SubSection>

              <SubSection title="PDF">
                <Prose>
                  Renders the prototype in a headless Chromium instance via Playwright and exports
                  a high-fidelity PDF. Text is selectable and links are clickable. Page dimensions
                  follow the prototype's natural size.
                </Prose>
                <Note>
                  PDF export requires <Code>playwright-core</Code> and a compatible Chromium
                  binary. Run <Code>pnpm exec playwright install chromium</Code> inside the{' '}
                  <Code>app/</Code> directory after cloning if you are self-hosting.
                </Note>
              </SubSection>

              <SubSection title="MP4 video">
                <Prose>
                  Captures your animated prototype at 30 fps and encodes it as an MP4. This is a
                  real programmatic frame capture, not a screen recording. The output is
                  deterministic and produces the same video every time for the same input.
                </Prose>
                <Note>
                  MP4 export works best for prototypes with CSS animations and transitions. The
                  default capture window is 8 seconds.
                </Note>
              </SubSection>

              <SubSection title="PPTX presentation">
                <Prose>
                  Available in <strong>Deck</strong> mode only. Exports a <Code>.pptx</Code> file
                  with one slide per artboard. The file can be opened in PowerPoint, imported into
                  Keynote, or uploaded to Google Slides.
                </Prose>
              </SubSection>

              <SubSection title="Code handoff">
                <Prose>
                  The code handoff buttons convert your prototype into a production-ready component
                  file using AI. Three target frameworks are available:
                </Prose>
                <InfoGrid items={[
                  {
                    label: 'React (.tsx)',
                    desc: 'TypeScript functional component. Inline CSS is kept as a style tag; DOM-heavy logic is wrapped in a useEffect hook.',
                  },
                  {
                    label: 'Vue (.vue)',
                    desc: 'Vue 3 Single File Component using Composition API with <script setup lang="ts">. DOM logic uses onMounted / onUnmounted.',
                  },
                  {
                    label: 'Svelte (.svelte)',
                    desc: 'Svelte 5 component using $state() and $effect() runes. Event handlers use Svelte syntax (onclick={...}).',
                  },
                ]} />
                <Prose style={{ marginTop: 10 }}>
                  The generated file downloads automatically. It is self-contained with no
                  dependencies beyond the target framework itself.
                </Prose>
              </SubSection>
            </Section>

            <Divider />

            {/* Sharing */}
            <Section id="sharing" title="Sharing">
              <Prose>
                Click the <strong>Share</strong> button in the editor top bar to create a public
                share link. Share links are permanent and anyone with the URL can view the artifact
                in a read-only preview, with no account required.
              </Prose>
              <Prose>
                Share links expose only the rendered output, not the source HTML/CSS/JS or any
                project metadata. To revoke access to a shared artifact, delete it from the
                project.
              </Prose>
              <InfoGrid items={[
                {
                  label: 'Public, no login required',
                  desc: 'Anyone with the link can view the artifact. No sign-up gate is shown to viewers.',
                },
                {
                  label: 'Read-only',
                  desc: 'Viewers cannot edit or regenerate. The share page shows a live preview only.',
                },
                {
                  label: 'Permanent until deleted',
                  desc: 'The share link stays valid indefinitely. Deleting the artifact from your project removes it.',
                },
              ]} />
            </Section>

            <Divider />

            {/* Settings */}
            <Section id="settings" title="Settings and API keys">
              <Prose>
                Go to{' '}
                <Link href="/settings" style={{ color: 'var(--ac)', textDecoration: 'none' }}>Settings</Link>{' '}
                from the dashboard to configure your LLM provider keys and integrations.
              </Prose>

              <SubSection title="LLM providers">
                <InfoGrid items={[
                  {
                    label: 'Anthropic (Claude)',
                    desc: 'Get your key at console.anthropic.com. Models: claude-sonnet-4-6, claude-haiku-4-5, and others.',
                  },
                  {
                    label: 'OpenAI (GPT-4o)',
                    desc: 'Get your key at platform.openai.com. Models: gpt-4o, gpt-4o-mini.',
                  },
                  {
                    label: 'Google (Gemini)',
                    desc: 'Get your key at aistudio.google.com. Models: gemini-2.0-flash, gemini-1.5-pro.',
                  },
                  {
                    label: 'Ollama (local models)',
                    desc: 'Run Ollama locally. Set the base URL (default: http://localhost:11434). No API key required.',
                  },
                ]} />
              </SubSection>

              <SubSection title="Design integrations">
                <Prose>
                  Save your <strong>Figma personal access token</strong> in the Design integrations
                  section to avoid re-entering it on every Figma ingestion. The token is saved
                  per-user and linked to your account.
                </Prose>
              </SubSection>

              <SubSection title="Key security">
                <Prose>
                  All API keys are encrypted with AES-256-GCM before being stored in the database.
                  They are decrypted server-side only at generation time and are never sent to the
                  browser or logged. The encryption key is set via the <Code>ENCRYPTION_KEY</Code>{' '}
                  environment variable on your server.
                </Prose>
              </SubSection>

              <SubSection title="Inline key entry">
                <Prose>
                  If you prefer not to save keys to Settings, click the provider chip at the top of
                  the editor controls column to open the model selector and enter a key for the
                  current session only. Session-entered keys are never persisted.
                </Prose>
              </SubSection>
            </Section>

            <Divider />

            {/* Self-hosting */}
            <Section id="self-hosting" title="Self-hosting">
              <SubSection title="Prerequisites">
                <ul style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 4, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <li>Node.js 20 or later and <Code>pnpm</Code></li>
                  <li>A Supabase project (free tier is sufficient)</li>
                  <li>A Clerk application for authentication</li>
                  <li>At least one LLM provider API key</li>
                </ul>
              </SubSection>

              <SubSection title="Setup">
                <ol style={{ paddingLeft: 20, margin: 0, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.7 }}>
                  <li>
                    Clone the repository:
                    <CodeBlock>git clone https://github.com/Pandemonium-Research/OpenDesign</CodeBlock>
                  </li>
                  <li>
                    Copy the env template and fill in all values:
                    <CodeBlock>cp .env.example .env</CodeBlock>
                  </li>
                  <li>
                    Apply the three database migrations in order using the Supabase SQL editor or
                    the Supabase CLI:
                    <CodeBlock>{`supabase db push
# or run manually:
# app/supabase/migrations/001_init.sql
# app/supabase/migrations/002_phase2.sql
# app/supabase/migrations/003_phase3.sql`}</CodeBlock>
                  </li>
                  <li>
                    Install dependencies (run inside the <Code>app/</Code> directory):
                    <CodeBlock>pnpm install</CodeBlock>
                  </li>
                  <li>
                    Start the dev server, or build for production:
                    <CodeBlock>{`pnpm dev
# or for production:
pnpm build && pnpm start`}</CodeBlock>
                  </li>
                </ol>
              </SubSection>

              <SubSection title="Environment variables">
                <div style={{ background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 10, overflow: 'hidden' }}>
                  {[
                    { key: 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', desc: 'Clerk frontend publishable key' },
                    { key: 'CLERK_SECRET_KEY', desc: 'Clerk server secret key' },
                    { key: 'NEXT_PUBLIC_SUPABASE_URL', desc: 'Supabase project URL' },
                    { key: 'SUPABASE_SERVICE_ROLE_KEY', desc: 'Supabase service role key (never expose to the browser)' },
                    { key: 'ENCRYPTION_KEY', desc: 'Random 32-character string used for AES-256-GCM key encryption' },
                    { key: 'ANTHROPIC_API_KEY', desc: 'Optional server-level fallback key for all users' },
                    { key: 'OPENAI_API_KEY', desc: 'Optional server-level fallback key for OpenAI' },
                    { key: 'FIGMA_TOKEN', desc: 'Optional server-level Figma token fallback' },
                    { key: 'GITHUB_TOKEN', desc: 'Optional GitHub token for higher API rate limits (5 000/hr vs 60)' },
                  ].map((v, i) => (
                    <div key={v.key} style={{
                      display: 'flex', gap: 16, padding: '10px 14px',
                      borderTop: i === 0 ? 'none' : '1px solid var(--rule)',
                      alignItems: 'flex-start',
                    }}>
                      <code style={{
                        fontFamily: 'var(--font-geist-mono)', fontSize: 11.5,
                        color: 'var(--ac)', flexShrink: 0, marginTop: 1,
                        whiteSpace: 'nowrap',
                      }}>{v.key}</code>
                      <span style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{v.desc}</span>
                    </div>
                  ))}
                </div>
              </SubSection>

              <SubSection title="Docker Compose">
                <Prose>
                  A <Code>docker-compose.yml</Code> is included in the repository root for
                  single-command deployment. Set all environment variables in a <Code>.env</Code>{' '}
                  file at the repo root before running.
                </Prose>
                <CodeBlock>docker compose up -d</CodeBlock>
              </SubSection>

              <SubSection title="Clerk configuration">
                <Prose>
                  In your Clerk dashboard, set the <strong>Sign-in URL</strong> to{' '}
                  <Code>/sign-in</Code> and the <strong>Sign-up URL</strong> to{' '}
                  <Code>/sign-up</Code>. Add a webhook pointing to{' '}
                  <Code>/api/webhooks/clerk</Code> with the <Code>user.created</Code> event
                  selected and paste the webhook secret as <Code>CLERK_WEBHOOK_SECRET</Code>.
                </Prose>
              </SubSection>
            </Section>

            <Divider />

            {/* Troubleshooting */}
            <Section id="troubleshooting" title="Troubleshooting">
              <FaqItem q="Generation fails with a 400 or 401 error">
                Usually means the AI provider rejected the request. Check that your API key is
                valid and has available credits. Switch to a different provider in the model
                selector and try again.
              </FaqItem>
              <FaqItem q="PDF or MP4 export returns a 500 error">
                These exports require a Playwright browser binary. Run{' '}
                <Code>pnpm exec playwright install chromium</Code> inside the <Code>app/</Code>{' '}
                directory on your server and restart the application.
              </FaqItem>
              <FaqItem q="Figma ingestion returns 403">
                Your personal access token does not have access to that file. Ensure the file is
                shared with your Figma account and that the token was generated after the file was
                shared with you.
              </FaqItem>
              <FaqItem q="GitHub ingestion finds no design token files">
                The repository may not have files matching the expected name patterns. OpenDesign
                looks for <Code>globals.css</Code>, <Code>variables.css</Code>,{' '}
                <Code>tailwind.config.*</Code>, and <Code>tokens.json</Code>. For repositories
                with differently-named files, use the URL ingestion tab and paste the raw file URL
                directly.
              </FaqItem>
              <FaqItem q="The generated output looks wrong or is incomplete">
                Try a more specific prompt, or use refine mode with a targeted instruction like{' '}
                "fix the layout" or "complete the missing sections." Switching to a more capable
                model also helps for complex designs.
              </FaqItem>
              <FaqItem q="Ollama is not connecting">
                Ensure Ollama is running locally (<Code>ollama serve</Code>) and that the base URL
                in the provider selector matches the port Ollama is listening on (default{' '}
                <Code>http://localhost:11434</Code>). CORS must allow the origin your Next.js
                server is running on.
              </FaqItem>
            </Section>

          </article>
        </div>

        {/* Footer */}
        <footer style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 48px', borderTop: '1px solid var(--rule)',
          fontSize: 12, color: 'var(--ink-4)', fontFamily: 'var(--font-geist-mono)',
        }}>
          <span>© 2026 Pandemonium Research</span>
          <div>
            <Link href="/sign-in" style={{ color: 'var(--ink-3)', textDecoration: 'none', marginLeft: 20 }}>Sign in</Link>
            <a href="https://github.com/Pandemonium-Research/OpenDesign" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--ink-3)', textDecoration: 'none', marginLeft: 20 }}>GitHub</a>
            <Link href="/docs" style={{ color: 'var(--ac)', textDecoration: 'none', marginLeft: 20 }}>Docs</Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ---- Primitives ----

function NavLink({ href, children, active }: { href: string; children: ReactNode; active?: boolean }) {
  return (
    <a href={href} style={{
      fontSize: 13, padding: '8px 14px', textDecoration: 'none', borderRadius: 999,
      fontWeight: 500, color: active ? 'var(--ac)' : 'var(--ink-3)',
      background: active ? 'var(--ac-bg)' : 'transparent',
    }}>
      {children}
    </a>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} style={{ scrollMarginTop: 80, marginBottom: 48 }}>
      <h2 className="serif" style={{
        fontWeight: 400, fontSize: 36, lineHeight: 1.1,
        letterSpacing: '-0.02em', color: 'var(--ink)', margin: '0 0 24px',
      }}>
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', margin: '0 0 10px' }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function Prose({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p style={{ fontSize: 14, lineHeight: 1.75, color: 'var(--ink-2)', margin: '0 0 10px', ...style }}>
      {children}
    </p>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <code style={{
      fontFamily: 'var(--font-geist-mono)', fontSize: 12,
      background: 'var(--ac-bg)', color: 'var(--ac)',
      padding: '2px 6px', borderRadius: 4, border: '1px solid var(--ac-bd-15)',
    }}>
      {children}
    </code>
  );
}

function CodeBlock({ children }: { children: ReactNode }) {
  return (
    <div style={{
      background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 8,
      padding: '12px 16px', fontFamily: 'var(--font-geist-mono)', fontSize: 12.5,
      color: 'var(--ink)', overflowX: 'auto', margin: '8px 0',
    }}>
      <pre style={{ margin: 0 }}>{children}</pre>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex', gap: 10,
      background: 'var(--ac-bg)', border: '1px solid var(--ac-bd-15)',
      borderRadius: 8, padding: '10px 14px', margin: '10px 0',
      fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.65,
    }}>
      <span style={{ color: 'var(--ac)', flexShrink: 0, fontWeight: 700, fontSize: 13 }}>i</span>
      <span>{children}</span>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--rule)', margin: '8px 0 40px' }} />;
}

function InfoGrid({ items }: { items: { label: string; desc: string }[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '10px 0' }}>
      {items.map((item) => (
        <div key={item.label} style={{
          display: 'flex', gap: 14, padding: '12px 14px',
          background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 10,
        }}>
          <div style={{ width: 3, borderRadius: 2, background: 'var(--ac)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 3 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ArtifactTypeItem({ color, label, desc }: { color: string; label: string; desc: string }) {
  return (
    <div style={{
      display: 'flex', gap: 12, padding: '12px 14px',
      background: 'var(--paper-2)', border: '1px solid var(--rule)', borderRadius: 10,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, marginTop: 4 }} />
      <div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{label}</span>
        <span style={{ fontSize: 13, color: 'var(--ink-3)', marginLeft: 8 }}>{desc}</span>
      </div>
    </div>
  );
}

function ExamplePrompts({ prompts }: { prompts: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, margin: '10px 0' }}>
      {prompts.map((p) => (
        <div key={p} style={{
          padding: '9px 12px 9px 28px', background: 'var(--paper-2)',
          border: '1px solid var(--rule)', borderRadius: 8,
          fontFamily: 'var(--font-geist-mono)', fontSize: 12,
          color: 'var(--ink-2)', lineHeight: 1.5, position: 'relative',
        }}>
          <span style={{ position: 'absolute', left: 11, top: 10, color: 'var(--ac)', fontSize: 11 }}>&rsaquo;</span>
          {p}
        </div>
      ))}
    </div>
  );
}

function FaqItem({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid var(--rule)' }}>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-0.01em', margin: '0 0 7px' }}>{q}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ink-2)', margin: 0 }}>{children}</p>
    </div>
  );
}
