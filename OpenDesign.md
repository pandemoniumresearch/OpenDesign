# Building an open-source, model-agnostic Claude Design with real video export

**Build it. The market gap is real, the core technical differentiator is achievable, and the full stack composes from existing OSS — but a realistic MVP is 6–9 months for two people, and "match-plus-exceed Claude Design" is 18–24 months.** The wedge is clear: no product today combines OSS + model-agnostic + multi-artifact generation (prototype/deck/marketing) + editable PPTX + real video export from HTML/CSS/JS animations + design-system ingestion. Claude Design ships all of those *except* OSS, model-agnostic, and actual video file export. Every OSS contender (Penpot, Onlook, tldraw + Make Real) covers at most two of the three white-space dimensions. The primary technical risk is not collaboration, not the LLM layer, not PPTX — it's **deterministic HTML/CSS/JS-to-video rendering**, and it has a known, working architecture pattern (Puppeteer + `HeadlessExperimental.beginFrame` + virtual-clock injection + FFmpeg) that is solvable in weeks, not months. The hardest *product* problem is the multi-artifact orchestration layer — teaching one agent to generate a coherent prototype, deck, and marketing page from a single brand context.

## The actual market gap

Claude Design's real innovation isn't AI-generated UI — v0, Lovable, Bolt, Figma Make, Magic Patterns, and Onlook all do that. It's **coherent multi-artifact generation from a single ingested design system**, with production-quality export formats. Running the full 20-tool feature matrix: exactly one product (Claude Design) ships prototype + deck + marketing with PPTX export and design-system-from-codebase ingestion, and it's closed and Anthropic-locked. Builder.io Fusion comes closest on code handoff and Figma-to-repo token mapping but has no deck generation. Onlook is the only credible OSS + model-agnostic generator but it's React-only, alpha-maturity, and outputs code files — not a design artifact.

**Editable PPTX is the most underserved format in OSS.** Marp exports image-rasterized PPTX (not editable text boxes in PowerPoint), Slidev does PDF well but PPTX poorly, and Reveal.js doesn't export PPTX at all. Generating PowerPoint-native XML shapes with editable text and round-trip compatibility requires `pptxgenjs` (MIT, JS) or `python-pptx` (MIT, Python) — neither has been wired to an LLM design generator in any OSS project. This is a small, well-defined engineering problem, and it's a real differentiator.

**Video export from arbitrary HTML/CSS/JS animations is the biggest technical white space.** Rive exports MP4 but only from `.riv` files via its paid Cloud Renderer. Claude Design's own marketing mentions "video, shaders, 3D" in prototypes, but these render in-browser — users screen-record to capture them. No product in the surveyed market exports LLM-generated HTML animations as actual MP4 files. The architecture to do this exists (Remotion built a $20M+ business on it) but Remotion's license prohibits building a competing LLM-authoring product on top, and its component model (pure functions of `useCurrentFrame()`) doesn't accept arbitrary LLM-generated HTML with CSS animations or `requestAnimationFrame`. Everyone else has left this unbuilt.

## The recommended stack

Pick libraries that are OSS-compatible, TypeScript-native, and compose cleanly on a Supabase + Vercel + one-Node-host footprint. Concrete choices:

| Layer | Choice | Why |
|---|---|---|
| **App framework** | Next.js 15 (App Router) on Vercel | Streaming-native, Edge + Node split, standard stack |
| **Auth** | Clerk | Requested; integrates cleanly with Supabase RLS via JWT |
| **Database + storage + storage** | Supabase (Postgres + Storage + Edge Functions) | Requested; use RLS for org-scoped sharing |
| **LLM orchestration** | **Vercel AI SDK v6** + **Mastra** (Apache-2.0) | Unified streamText/generateObject; first-party providers for OpenAI/Anthropic/Gemini/Bedrock; `ai-sdk-ollama` for local; Mastra adds agents/workflows/memory/evals without locking you into LangChain's heavier abstractions |
| **BYOK multi-provider path** | OpenRouter via `@ai-sdk/openai-compatible` | Lets users bring one key and access 200+ models |
| **Real-time collaboration** | **Yjs** + **Hocuspocus** (MIT) for MVP | Standard CRDT, awareness for cursors, offline via y-indexeddb. Hocuspocus runs on a separate Node host (Fly.io/Railway) since Vercel can't host long-lived WebSockets. Migrate to **y-partyserver on Cloudflare Durable Objects** at scale |
| **Canvas / editor surface** | **Build fresh** on Yjs + a custom canvas (Pixi or Fabric or raw Canvas2D), *not* Penpot or tldraw SDK | See reasoning below |
| **Whiteboard / sketch surface** | **Excalidraw** (MIT) embedded or **tldraw v1** (MIT) | Avoids tldraw SDK 4.x commercial license; Excalidraw is actively MIT-maintained |
| **Slide/deck model** | **Build fresh** with a JSON document schema | No OSS deck tool produces editable PPTX at quality |
| **PPTX export** | `pptxgenjs` (MIT) for editable PowerPoint | Generates real XML shapes; runs in Node or browser |
| **PDF export** | Playwright `page.pdf()` server-side | Highest fidelity |
| **Video export (primary)** | **Puppeteer + `HeadlessExperimental.beginFrame` + virtual-clock injection + FFmpeg** on a Cloud Run container | The Replit/`puppeteer-capture`/`timecut` pattern. All MIT. Not Remotion |
| **Video export (fast path)** | **WebCodecs + Mediabunny** (MPL-2.0) for canvas-native animations | 10× faster than realtime in-browser, free, Chromium-only |
| **Background jobs** | **Inngest** or **Trigger.dev** | Design-system ingestion, long renders, PPTX builds |
| **Design token format** | **W3C DTCG 2025.10** JSON | Recently stabilized; Figma, Penpot, Style Dictionary v4, Tokens Studio all write it |
| **Token transform** | **Style Dictionary v4** or **Terrazzo** (MIT) | |
| **CSS → tokens** | **@projectwallace/css-design-tokens** (MIT) | Already does "site CSS → DTCG"; closest off-the-shelf fit |
| **Repo AST analysis** | **ts-morph** (MIT) | Shadcn/MUI/Chakra theme extraction |
| **Storybook ingestion** | **@storybook/csf-tools** (MIT) | Gets canonical component usage |
| **Brand palette from images** | **node-vibrant v4** (MIT) | |
| **Figma ingestion** | REST API + custom Figma plugin fallback | Variables REST endpoints are Enterprise-only; plugin is the workaround |
| **Code handoff compiler** | **Builder.io Mitosis** (MIT) | The only battle-tested OSS cross-framework JSX compiler (React/Vue/Svelte/Solid/Qwik/Angular from one source) |

This is entirely OSS-licensed, with the caveat that `y-redis` (an attractive scale-out Yjs backend) is AGPL — swap to `y-partyserver` at scale if AGPL is unacceptable.

## Why not Penpot, tldraw SDK, or Remotion

Three tempting "just fork it" options fail on closer inspection.

**Penpot** is the most complete OSS design tool, and its ClojureScript + Clojure + new Rust/WASM/Skia renderer is genuinely world-class. But it's wrong for this product: the data model is vector/SVG-centric, and slides + interactive prototypes + marketing pages need a page/template/master abstraction that Penpot doesn't natively express. The Clojure codebase also narrows contributor recruitment for a two-person OSS project. **Compose Penpot as an optional embedded canvas** via its plugin API and MCP server for users who want vector editing, but don't fork it as your base.

**tldraw SDK 4.x** has the best canvas primitives for embedding live React components as shapes — ideal for mixing interactive prototypes and slides on one surface. But its 2025 license change makes production commercial use require a paid key. The MIT v1 code is dated. Use tldraw v1 as reference, or embed Excalidraw for the whiteboard surface, but **do not build your core editor on the commercial SDK**.

**Remotion** is architecturally the closest existing system to the video export pipeline you need. Don't use it. Two independent blockers: (1) its license forbids "selling, renting, licensing, relicensing, or sublicensing your own derivative of Remotion," and a LLM-authoring product built on Remotion's render pipeline is almost certainly a derivative; (2) Remotion explicitly forbids CSS animations, `requestAnimationFrame`, and all wall-clock-based animation — content must be authored as pure functions of `useCurrentFrame()`. LLM-generated HTML emits CSS animations by default. You'd constrain the LLM's entire output space to fit Remotion's component model, which defeats the purpose. Study Remotion's architecture, then build your own using the same OSS primitives it uses.

## The video export architecture in detail

This is the key differentiator and the only genuinely hard engineering problem. The architecture that works:

**Server-side: Puppeteer (pinned `chrome-headless-shell`) launches Chrome with `--run-all-compositor-stages-before-draw`, `--deterministic-mode`, `--enable-begin-frame-control`.** Before the animation loads, inject a JavaScript bundle that monkey-patches `setTimeout`, `setInterval`, `requestAnimationFrame`, `Date`, `Date.now()`, `performance.now()`, and a seeded `Math.random`. Wait for `document.fonts.ready`. Then, for each output frame, advance the virtual clock by `1000/fps` ms, fire queued callbacks in order, and call `HeadlessExperimental.beginFrame({ frameTimeTicks, interval, screenshot: { format: 'png' } })`. Pipe PNG bytes into `ffmpeg` via stdin for H.264/VP9 encoding.

This is the exact pattern used by the MIT-licensed `puppeteer-capture`, `timecut`, `timeweb`, and `WebVideoCreator` projects, and by Replit's internal renderer (described in a Feb 2026 blog post). `beginFrame` is the only way to make CSS animations deterministic — JS clock virtualization alone freezes JS-driven animation but compositor-driven CSS transitions still drift. The API has been stable for years across Chrome versions despite its "experimental" label; Remotion and the whole ecosystem would break if it were removed.

Expected performance on a single container: **0.5–5× realtime** for complex 1080p60 animations. At Cloud Run pricing (2 vCPU / 4GB for ~120s per minute of video), that's roughly **$0.005–0.02 per minute of exported video**. Parallelize across containers using the chunk-then-stitch pattern (render frames N..M on each worker, concat with FFmpeg) to hit Remotion-class throughput.

**Client-side fast path: WebCodecs + Mediabunny** for animations that live entirely on a `<canvas>` (Three.js, p5, pure Canvas2D). Feed frames via `new VideoFrame(canvas, { timestamp })` with a controlled frame loop, encode to H.264 via `VideoEncoder`, mux with Mediabunny. Measured 5–10× realtime on modern laptops. Zero server cost. Chromium-only; Safari support is partial.

**DOM rasterization in-browser is the unsolved path.** `html2canvas`, `html-to-image`, and friends break on WebGL canvases, cross-origin iframes, `backdrop-filter`, and `<video>` elements. There is no way to reliably rasterize arbitrary DOM including shaders and 3D content purely in-browser in 2026. **This is why server-side must be the primary path** — LLM-generated "frontier design: voice, video, shaders, 3D" breaks every in-browser rasterizer.

**Hard sub-problems you'll hit and their resolutions:** font loading (await `document.fonts.ready`); compositor warmup (pump skip-frames at 30fps before recording starts); `<video>` element sync (Replit's pattern: intercept with MutationObserver, preprocess to fragmented MP4 server-side, decode via `mp4box.js` + WebCodecs in-page, paint to canvas overlay); audio sync (patch Web Audio API to spy on intent, mix server-side in FFmpeg post-hoc with known timestamps); WebGL on Lambda (Lambda has no GPU — swiftshader is 10× slower; use Cloud Run or a dedicated VM with GPU for heavy 3D); macOS (`HeadlessExperimental` is unreliable on Mac — restrict capture to Linux/Windows infra).

Skip audio and `<video>` sync in the MVP. Require them in phase 3. This keeps the video pipeline buildable in 4–6 weeks by one person; the full set of sync features is a multi-month effort (Replit's renderer is ~1200 LOC *just for the core*, plus the Web Audio and video patches).

## The multi-artifact orchestration problem

Claude Design's real product moat — the thing that will be hardest to replicate — is not UI generation. It's the orchestration layer that takes one prompt plus one design system and produces a *coherent set* of artifacts (interactive prototype + pitch deck + landing page + social assets) that all share the same brand identity, spacing grid, component semantics, and copy tone. This is an agent-workflow problem, not a UI-model problem.

Architecturally this is: **brand context extraction → artifact routing → per-artifact generation → cross-artifact consistency checking**. Build it with Mastra workflows on top of AI SDK. The brand context is a DTCG token set plus a "component card" — a compact JSON that enumerates extracted components with usage examples and Zod-typed props. Every downstream generation call prepends this context. The consistency check is a cheap validation pass (does the deck use colors that exist in the token set? Does the prototype import only components in the card?).

This is where model-agnosticism *matters most and is hardest*. Anthropic and OpenAI handle tool calling and structured output differently; Gemini's schema validator rejects `anyOf` and untagged unions; Ollama with smaller models breaks on JSON repair without cascade parsing. AI SDK normalizes 80% of this; the remaining 20% needs feature flags and per-provider prompt variants. Budget real time for evals across providers — Mastra ships an eval framework; use it.

## What to compose vs. what to build fresh

**Compose (install and wire):** Vercel AI SDK, Mastra, Yjs, Hocuspocus, Clerk, Supabase, pptxgenjs, Playwright (for PDF + screenshot), ffmpeg, ts-morph, Style Dictionary, @projectwallace/css-design-tokens, node-vibrant, @storybook/csf-tools, Builder Mitosis (if/when code handoff matters), Excalidraw (embedded for whiteboard), puppeteer-capture (fork or study as reference for the video pipeline).

**Build fresh (the real engineering work):**
- The canvas editor (Yjs-backed document model with elements/frames/pages, multi-user awareness, selection, transform handles, alignment tools). ~8–12 weeks for one engineer.
- The deck/slide document model and its PPTX exporter via pptxgenjs (slide-master concept, template inheritance, editable text boxes, image handling). ~3–4 weeks.
- The video export service (Puppeteer + beginFrame + virtual-clock + FFmpeg, Dockerized, on Cloud Run; optional chunked parallel rendering). ~4–6 weeks for MVP; ongoing.
- The multi-artifact orchestration agent (Mastra workflow; brand context → routed per-artifact generation with consistency checks). ~4–6 weeks for MVP; ongoing.
- The design system ingestion pipeline (GitHub URL → sandboxed clone → AST parse → DTCG token extraction; Figma URL → REST + plugin fallback; live URL → Playwright capture). ~4–6 weeks for MVP; each additional UI library takes ~1 week to add.
- The LLM handoff-to-code pipeline (DTCG + component card + artifact JSON → framework-specific code via Mitosis). ~3–4 weeks, ongoing as frameworks are added.
- The editor UI (React + Tailwind + shadcn/ui + the custom canvas). Ongoing.

## Phased roadmap

**Phase 0 — Spike (weeks 1–3).** Validate the two highest-risk technical assumptions with disposable prototypes. First: get `HeadlessExperimental.beginFrame` + virtual-clock working end-to-end on Cloud Run, exporting a 10-second CSS-animation page to MP4 with correct determinism. Second: prove one-shot LLM generation of a coherent prototype + deck from a DTCG token set via AI SDK + Mastra, across Anthropic/OpenAI/Gemini. Ship both as internal demos. Kill the project if either is intractable; otherwise proceed with confidence.

**Phase 1 — MVP (months 2–6).** Single-user-first. Authenticated app (Clerk + Supabase). One canvas-based artifact type: an HTML/CSS/JS "prototype" rendered from a JSON document model. One LLM flow: prompt → prototype. One design-system input: paste-a-website URL → Playwright + Wallace → DTCG tokens → stored brand context. Three export formats: HTML (static bundle), PDF (Playwright), MP4 (server-side video pipeline). Multi-provider via AI SDK with first-party OpenAI/Anthropic/Gemini + Ollama. No collaboration yet. No decks yet. Self-hostable via Docker Compose. This is the demonstrable product; it establishes the wedge (OSS + model-agnostic + real video export).

**Phase 2 — Multi-artifact and collab (months 7–12).** Add the deck artifact type with pptxgenjs-based PPTX export. Add marketing-page artifact (landing-page component layouts). Add real-time collaboration via Yjs + Hocuspocus on a Fly.io Node host, with cursors and awareness. Add GitHub-repo ingestion (shadcn + Tailwind v3/v4 detection; ts-morph-based component card extraction). Add multi-artifact orchestration (one prompt → prototype + deck + one-pager with shared brand context). Add comments, share links, org-scoped permissions via Supabase RLS.

**Phase 3 — Polish and frontier features (months 13–18).** Figma file ingestion via REST + distributed Figma plugin. Storybook ingestion via csf-tools. Animation system with timeline UI + deterministic video export of multi-scene compositions. Handoff-to-code via Mitosis (React/Vue/Svelte emitters). Client-side WebCodecs fast-path for canvas-native exports. Audio and `<video>` sync in the render pipeline. Adjustment sliders/inline-comment UX. Web capture tool (browser extension that scrapes a running site into a DTCG bundle).

**Phase 4 — Exceed Claude Design (months 18–24).** Voice-driven interaction (Whisper + provider-native TTS). 3D and shader authoring (Three.js + a GPU-enabled render VM for video export). Chunked distributed Lambda rendering for long videos. Plugin system mirroring Penpot's. Template marketplace. Enterprise self-host + SSO.

## Where a two-person team actually lands

Be realistic. The user profile is **one strong CS undergrad with systems/security background and one collaborator**. That's one full-time engineer who can handle the deep technical work (canvas, video pipeline, sandboxed code execution, auth/permissions) and one partner whose skills determine whether product/design/frontend-polish keeps pace. The stack above assumes shared TypeScript fluency on both sides.

**Phase 1 MVP is achievable in 5–7 months** if both people work full-time, the collaborator handles UI/UX and product while the lead owns the video pipeline, canvas engine, and ingestion. If the collaborator is part-time or junior, add 2–3 months. The single biggest schedule risk is the canvas editor — building a usable, multi-selection, aligned, snappable, Yjs-synced canvas from scratch is a 3-month sinkhole. **Mitigate by starting with a brutally minimal canvas** (drag/drop frames, no free-form vector editing) and deferring professional-grade editing to phase 3, or by embedding Excalidraw for the whiteboard flows while building only slide/frame layout from scratch.

**Phase 2 adds another 6 months** for decks + collab + repo ingestion + orchestration. Real-time collab specifically — while Yjs/Hocuspocus gets you 80% for free — will eat 4–6 weeks on edge cases (reconnection races, selection semantics, snapshot compaction).

**Phases 3–4 are where it gets hard.** Each frontier feature (shaders-to-video, Figma variables plugin, audio sync in video, handoff-to-code) is 1–3 weeks of focused work that assumes the foundation is rock-solid. At two people full-time, budget **18 months to a product that plausibly matches Claude Design's feature set**, and **24 months to clearly exceed it** with exported video, self-hosting, and model-agnosticism as the moat.

**What could kill the timeline:** (1) trying to build a Figma-competitive vector editor (don't — you're not making Figma); (2) underestimating PPTX fidelity edge cases (invest in a round-trip test harness early); (3) not hiring design taste (a bad-looking OSS design tool is dead on arrival — if the collaborator doesn't own brand/design, pay a contract designer); (4) scope creep into model-training or fine-tuning (stay on prompting + structured output, period); (5) security incidents from naive `npm install` on user repos (sandbox repo ingestion in Firecracker/gVisor or pure-static parsing from day one — the lead's security background is a direct asset here).

## The honest bottom line

The three pillars — OSS, model-agnostic, video export — are each individually achievable with known OSS primitives. What no one has done is **package them with Claude-Design-grade multi-artifact orchestration in a collaborative editor with production-quality PPTX**, and that packaging is the actual 18-month job. The novel engineering problems reduce to three: deterministic HTML-to-video rendering (solved architecturally, 4–6 weeks to implement), sandboxed repo ingestion for design-system extraction (security problem, not a novel algorithm), and cross-provider LLM orchestration with structured output stability (eval-driven grind, not invention). **Everything else is integration work.** The differentiator that makes this worth doing is not that any single piece is technically hard — it's that no one has aligned these specific OSS pieces toward this specific wedge, and the wedge (model-agnostic + OSS + video export from HTML) is load-bearing for a meaningful fraction of the market that Anthropic's closed product cannot serve.