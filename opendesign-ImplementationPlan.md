# OpenDesign MVP Implementation Plan

## Context
Starting from a blank slate (only OpenDesign.md spec exists). Goal is the Phase 1 MVP from the spec: a working, self-hostable, model-agnostic design tool that generates HTML/CSS/JS prototypes from a prompt, ingests a website's design tokens, and exports to HTML / PDF / MP4. The three-pillar wedge (OSS + model-agnostic + real video export) must be demonstrable by end of Phase 1.

**Critical scope constraint:** Do NOT build a custom canvas editor in MVP. Use an iframe preview of generated HTML only. This avoids the 3-month canvas sinkhole the spec warns about.

---

## Step 0: Node.js Virtual Environment

Pin the Node.js version for the project using `nvm` (or Volta as fallback):

```bash
# In project root
nvm install 22          # LTS version compatible with Next.js 15
nvm use 22
node --version > .nvmrc  # pins version for all contributors
```

Install `pnpm` as the package manager (faster, disk-efficient):
```bash
corepack enable
corepack prepare pnpm@latest --activate
```

All subsequent commands use `pnpm`. The `.nvmrc` + `corepack` entry in `package.json` form the "virtual environment" equivalent for Node.js projects.

---

## Phase 0 — Spike (validate before building, ~1 week)

Before full scaffolding, two throwaway prototypes must pass:

1. **Video spike** — Node script: Puppeteer + `HeadlessExperimental.beginFrame` + virtual-clock injection + FFmpeg → export a 10s CSS-animation HTML page to MP4 with deterministic frames. Run locally first, then in a Docker container.
2. **LLM spike** — Single Next.js API route: send a prompt + minimal DTCG token set to Anthropic, OpenAI, and Gemini via AI SDK `generateObject`, receive back a structured `{ html, css, js }` prototype JSON. Confirm schema stability across providers.

If either spike fails, stop and redesign. If both pass, proceed.

---

## Phase 1 — Full MVP Scaffold

### Step 1: Project Scaffolding
**Commands:** `npx create-next-app@latest opendesign --typescript --tailwind --app --src-dir`
**Then install:**
```
@clerk/nextjs
@supabase/ssr @supabase/supabase-js
ai @ai-sdk/anthropic @ai-sdk/openai @ai-sdk/google ollama-ai-provider
mastra @mastra/core
zod
shadcn/ui (via CLI)
```

**Files to create:**
- `next.config.ts` — with server actions, image domains
- `.env.local` — CLERK keys, SUPABASE URL/anon/service key, provider API keys
- `src/lib/supabase/` — server + browser client helpers
- `src/lib/ai/` — provider factory (reads `OPENDESIGN_PROVIDER` env var, defaults to anthropic)

### Step 2: Auth with Clerk
- `src/middleware.ts` — Clerk middleware, protect `/app/*` routes
- `src/app/(auth)/sign-in/` and `/sign-up/` — Clerk-hosted UI components
- Supabase JWT integration: pass Clerk session token as Supabase auth header via RLS

**Supabase tables (migration files in `supabase/migrations/`):**
```sql
-- users (synced from Clerk webhook)
-- projects (id, user_id, name, brand_context jsonb, created_at)
-- artifacts (id, project_id, type text, document jsonb, created_at)
-- exports (id, artifact_id, format text, storage_path text, created_at)
```

### Step 3: Core LLM Generation
**`src/lib/ai/generate-prototype.ts`**
- Uses AI SDK `generateObject` with Zod schema: `{ html: string, css: string, js: string, title: string }`
- Accepts `{ prompt, brandContext, provider }` — brandContext is a DTCG token subset serialized as CSS custom properties
- Provider-routing: reads `provider` param or env default; handles Anthropic/OpenAI/Gemini quirks (Gemini rejects `anyOf` — use flat Zod schema)

**`src/app/api/generate/route.ts`** — POST endpoint wrapping the above, auth-gated, saves artifact to Supabase

### Step 4: Design Token Ingestion
**`src/lib/ingestion/from-url.ts`**
- Uses `@projectwallace/css-design-tokens` to extract tokens from a live URL
- Playwright `page.goto(url)` → extract computed stylesheets → run Wallace → normalize to W3C DTCG JSON
- Runs server-side as a Next.js Server Action or API route
- Saves resulting DTCG bundle to `projects.brand_context`

**MVP scope:** URL ingestion only. GitHub repo and Figma ingestion are Phase 2.

### Step 5: Editor UI
**`src/app/app/[projectId]/page.tsx`** — main editor shell

Layout:
```
┌─────────────────────────────────────────────────┐
│ TopBar: project name | provider selector | export│
├──────────┬──────────────────────────────────────┤
│ Left     │ Canvas (iframe preview)               │
│ Panel:   │                                       │
│ - Prompt │ <iframe srcdoc={generatedHtml} />     │
│ - Brand  │                                       │
│   tokens │                                       │
│ - History│                                       │
└──────────┴──────────────────────────────────────┘
```

**Components needed:**
- `src/components/editor/PromptPanel.tsx` — textarea + submit, streams generation via `useCompletion` or `streamObject`
- `src/components/editor/CanvasPreview.tsx` — sandboxed iframe, hot-reloads on new artifact
- `src/components/editor/ProviderSelector.tsx` — dropdown: Anthropic / OpenAI / Gemini / Ollama
- `src/components/editor/BrandTokenPanel.tsx` — URL input → ingest → show extracted colors/fonts
- `src/components/editor/ExportPanel.tsx` — buttons: Export HTML | Export PDF | Export MP4

### Step 6: Export Pipeline

#### HTML export
- `src/app/api/export/html/route.ts` — zips `{ index.html, style.css, main.js }` with JSZip, returns blob

#### PDF export  
- `src/lib/export/pdf.ts` — Playwright server-side: `page.setContent(html)` → `page.pdf({ format: 'A4' })`
- Runs in `src/app/api/export/pdf/route.ts`
- **Note:** Playwright must run in a Node.js route handler, not Edge

#### MP4 video export (the differentiator)
This is the technically critical path. Architecture:

**`src/services/video-renderer/`** (separate Docker container):
- `renderer.ts` — Express server accepting `POST /render` with `{ html, css, js, durationSeconds, fps }`
- Uses `puppeteer` (pinned `chrome-headless-shell`) launched with:
  `--run-all-compositor-stages-before-draw --deterministic-mode --enable-begin-frame-control`
- Injects virtual-clock bundle (patches `Date`, `performance.now`, `requestAnimationFrame`, `setTimeout`, `setInterval`, seeded `Math.random`) before page load
- Awaits `document.fonts.ready`
- Loop: advance virtual clock by `1000/fps` ms → `HeadlessExperimental.beginFrame({ frameTimeTicks, screenshot: { format: 'png' } })` → pipe PNG to FFmpeg stdin
- FFmpeg encodes to H.264 MP4 (`libx264`, `yuv420p`, `-movflags faststart`)
- Returns MP4 as stream or uploads to Supabase Storage, returns signed URL

**`src/app/api/export/video/route.ts`** — calls the renderer service via fetch, polls for completion, streams result back to client

**`docker-compose.yml`** — defines `app` (Next.js) + `renderer` (video service) + `supabase` (local dev via Supabase CLI)

### Step 7: Multi-Artifact Orchestration (minimal)
**`src/lib/orchestration/brand-context.ts`** — extracts a "brand context" object: `{ tokens: DTCG, componentCard: {} }` from the ingestion pipeline

**`src/lib/orchestration/generate-artifact.ts`** (Mastra workflow stub)
- For MVP: just routes to `generate-prototype`
- Structure is already multi-artifact-ready for Phase 2 (deck, landing page)

### Step 8: Self-Hosting
**`Dockerfile`** — multi-stage Next.js build  
**`docker-compose.yml`:**
```yaml
services:
  app:        # Next.js on :3000
  renderer:   # video renderer on :3001
  # Supabase self-hosted via official compose or external
```
**`.env.example`** — all required env vars documented

---

## Critical Files Summary

| File | Purpose |
|---|---|
| `src/lib/ai/generate-prototype.ts` | Core LLM generation, provider-agnostic |
| `src/lib/ingestion/from-url.ts` | URL → DTCG token extraction |
| `src/lib/export/pdf.ts` | Playwright PDF export |
| `src/services/video-renderer/renderer.ts` | Puppeteer + beginFrame + FFmpeg |
| `src/app/api/generate/route.ts` | Generation API |
| `src/app/api/export/video/route.ts` | Video export API |
| `src/app/app/[projectId]/page.tsx` | Main editor UI |
| `supabase/migrations/001_init.sql` | DB schema |
| `docker-compose.yml` | Self-host config |

---

## Implementation Order (strict sequence)

1. Video spike (throwaway script, ~2 days)
2. LLM spike (throwaway API route, ~1 day)
3. Next.js scaffold + Clerk + Supabase schema (~1 day)
4. `generate-prototype.ts` + `/api/generate` + basic iframe preview UI (~2 days)
5. URL ingestion pipeline (~2 days)
6. HTML + PDF export (~1 day)
7. Video renderer service + Docker (~3–4 days)
8. Full editor UI polish + export panel (~2 days)
9. Docker Compose + .env.example + README (~1 day)

**Total: ~3 weeks for a working, demonstrable MVP**

---

## Verification

- [ ] `pnpm dev` → app loads, Clerk sign-in works
- [ ] Paste prompt → prototype generates and renders in iframe (test with Anthropic, OpenAI, Gemini)
- [ ] Paste URL → tokens extracted → colors/fonts shown in panel → next generation uses them
- [ ] Export HTML → download zip → open `index.html` in browser, renders correctly
- [ ] Export PDF → download PDF → text is selectable (not rasterized)
- [ ] Export MP4 → download MP4 → CSS animations play at correct speed, deterministic frames
- [ ] `docker-compose up` → all services start, full flow works without local Node install

## Deferred to Phase 2
- Custom canvas editor (drag/drop, transform handles)
- Deck/slide artifact type + PPTX export
- Real-time collaboration (Yjs + Hocuspocus)
- GitHub repo ingestion (ts-morph AST)
- Figma ingestion
- Multi-artifact orchestration (prototype + deck + landing page from one prompt)
- WebCodecs fast-path video export
