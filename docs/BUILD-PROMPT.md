# Wale — "Brass Cosmos" rebuild · Master build prompt

> **Orchestrator note (22 Oct 2026):** Nonso confirmed Wale's WhatsApp number is now **0704 014 9133** (`2347040149133`). Every occurrence of the old number (0903 603 3056 / `2349036033056`) in this document has been replaced with the new one, including the "verbatim" `prepare-deploy.mjs` in §15.4. See `docs/DECISIONS.md` D-001.

You are the **orchestrator** for this build. You coordinate three subagents (a **Planner**, a **Frontend Designer** and a **QA Tester**) to turn the current static HTML landing page in this repository into an immersive, 3D, animated **Next.js** site. The site must deploy to **Hostinger** without anyone ever running a build on their own computer.

Read this whole document before doing anything. It is long on purpose: every decision that could go wrong has already been made here. Where this document is specific, follow it exactly. Where it is silent, choose the simplest option that satisfies the non-negotiables, and write the decision down in `docs/DECISIONS.md`.

---

## 0. Mission

**Who:** Wale is a saxophonist based in **Ajah, Lagos, Nigeria**. He does two things:

1. **Performances.** Live saxophone at weddings, birthdays, proposals, dinners, launches, lounges and church events. He comes to the client ("home delivery") anywhere in Lagos.
2. **Lessons.** He teaches the saxophone one-on-one.

Clients reach him on **WhatsApp: 0704 014 9133** (international: `2347040149133`).

**The one idea of the site (Rule of One):** *Wale brings the saxophone to your door.* Performances arrive at your event, and lessons arrive in your living room. Every section supports that sentence.

**What exists now:** a hand-built static page, `index.html`, with an `images/` folder. It has a dark "pinstripe and brass" look: Bodoni Moda + Instrument Sans, near-black ground, brass `#D4A64A` accent. It covers performances only.

**What you are building:** the same brand, with the **typography kept exactly**, rebuilt as a Next.js static export with:

- a living 3D "Brass Cosmos" backdrop
- a sci-fi 3D "Orbit Gallery"
- cinematic scroll choreography
- tasteful pop-ups (booking consoles, contact menu, WhatsApp widget, lightbox, mobile sheet)
- a complete new **Lessons** chapter written with direct-response copywriting

**What success looks like:**

- A stranger understands within 5 seconds: who Wale is, that he plays events *and* teaches, that he comes to you, and how to message him.
- It feels "out of this world" on a good laptop and still fast, readable and fully usable on a mid-range Android phone on mobile data.
- Every booking path ends in a correctly pre-filled WhatsApp message to `2347040149133`.
- Nonso pushes to `main` on GitHub → GitHub Actions builds → Hostinger serves the new version. Nobody runs `npm run build` locally, ever.
- Wale or Nonso can change copy, prices and photos by editing one content file and swapping images with the same file names in the GitHub web editor.

---

## 1. Non-negotiables (MUST)

Each item has an ID. The Planner maps every ID to a task and to a test. The QA Tester reports PASS/FAIL per ID.

**Typography**

- **M-01:** Typography is preserved exactly: **Bodoni Moda** for display and **Instrument Sans** for body/UI. Sizes, weights, line-heights, letter-spacing and italic-brass emphasis follow §5.4. No other typefaces anywhere: no mono font, no "sci-fi" font, no 3D text meshes.
- **M-02:** All text is real, selectable DOM text, server-rendered into `out/index.html`. Nothing meaningful lives only inside a `<canvas>`.

**Stack and deploy**

- **M-03:** Next.js App Router with `output: 'export'`. The site is 100% static (HTML/CSS/JS/images). No server, no API routes with runtime logic, no Laravel, no database, no PHP.
- **M-04:** Deploys via the GitHub Actions workflow in §15. It builds on GitHub and publishes the built `out/` folder to a `deploy` branch, and Hostinger's Git integration pulls the `deploy` branch into `public_html`. It works on every Hostinger plan, including basic shared hosting. Never commit `out/`, `.next/` or `node_modules/` to `main`.

**WhatsApp**

- **M-05:** Every WhatsApp link is `https://wa.me/2347040149133?text=<encodeURIComponent(message)>`, with `target="_blank"` and `rel="noopener"`. Messages use the exact templates in §9.6.
- **M-06:** A floating WhatsApp button sits **bottom-right** on every viewport. It opens a small pop-up with three options (book a performance, ask about lessons, just a question). Each option is a real `<a href>` to WhatsApp.
- **M-07:** Every CTA works without JavaScript. Its `href` is a real `wa.me` link, and JavaScript *enhances* it by opening the matching console pop-up instead.

**Content**

- **M-08:** The page covers **both** offers: a Performances chapter and a Lessons chapter, using the copy in §6, transcribed into `src/content/site.ts`. Do not rewrite the copy. If something is genuinely broken (e.g. a heading that wraps badly), propose a fix in `docs/DECISIONS.md` and keep the original until Nonso approves.
- **M-09:** No invented facts. No made-up numbers, prices, reviews, student counts, years, client names, awards or claims. Unknown facts render as the visible `[BRACKET]` placeholders defined in §6, or the element hides, as specified per field. No fake urgency, no fake "someone just booked" toasts, no countdown timers, no fake ratings in JSON-LD.
- **M-10:** All copy, links, prices, flags and gallery items live in **one file**, `src/content/site.ts`. Components never hard-code copy.
- **M-11:** Photos are replaceable by dropping a new file with the **same name** into `public/images/`. Nothing else needs to change. The 3D gallery and DOM images must never stretch: cover-fit always.

**Accessibility and motion**

- **M-12:** Accessibility meets WCAG 2.2 AA: keyboard-operable everything, visible focus, focus trapped in and restored from every pop-up, 44px minimum touch targets, text contrast ≥ 4.5:1 (≥ 3:1 at 24px+), landmarks, one `<h1>`, ordered headings.
- **M-13:** Respect `prefers-reduced-motion`, `prefers-reduced-transparency` and `prefers-contrast`. Provide a visible **Motion on/off** toggle (persisted) so ongoing animation can be paused (WCAG 2.2.2).
- **M-14:** Graceful fallbacks. If WebGL is unavailable, fails, loses its context, or the device is weak, the site falls back to a beautiful static/DOM version with **no lost content or function**.

**Performance and quality**

- **M-15:** Performance budgets in §12 are met. The LCP element (hero portrait or H1) never waits on JavaScript or 3D.
- **M-16:** No runtime third-party requests. Fonts are self-hosted at build time via `next/font`, with no remote HDRIs, CDNs, analytics, or embedded iframes. The only outbound links are WhatsApp, `tel:` and (when set) Instagram/video URLs that open in a new tab.
- **M-17:** No emoji in the UI. No lorem ipsum. No generic AI aesthetics (purple gradients, neon cyberpunk, rainbow glows, Matrix rain, glassmorphism on everything).
- **M-18:** Layout works from **320px to 2560px** wide with no horizontal scrolling, and no text clipped or overlapping the WhatsApp button.
- **M-19:** `npm run lint`, `npm run build`, `npm run typecheck` and `node scripts/prepare-deploy.mjs` all pass with zero errors, from a clean clone. On Windows too: npm scripts must be cross-platform (Node scripts, no `rm -rf`, `cp` or bash in `package.json`).
- **M-20:** The QA gate (§16) passes with **zero open Blocker or Major issues** before the build is declared done.

---

## 2. Team and workflow

### 2.1 Roles

| Role | Owns | Never does |
|---|---|---|
| **Orchestrator (you)** | Sequencing, handoffs, resolving conflicts, keeping every M-ID covered, the final report to Nonso | Skip a QA gate; mark something done that QA has not passed |
| **Planner** | `docs/PLAN.md`: architecture, task breakdown, traceability matrix, risk register | Write application code |
| **Frontend Designer** | All application code, styles, shaders, scripts, README; self-review before every handoff | Mark QA items as passed; weaken a test to make it pass |
| **QA Tester** | Independent verification: tests under `tests/`, `docs/QA-REPORT.md`, screenshots | Edit application source files (it may only add or modify `tests/**`, `playwright.config.ts`, `lighthouserc.json` and `docs/QA-REPORT.md`) |

Spawn each role as a **separate subagent** (Claude Code: the Agent/Task tool, general-purpose type). Pass it:

1. its role brief from §2.5, **verbatim**
2. the path to this document (`docs/BUILD-PROMPT.md`), with the instruction to read it in full
3. the current milestone and the artifact it must produce

Also save the three briefs as reusable subagent definitions in `.claude/agents/planner.md`, `.claude/agents/frontend-designer.md` and `.claude/agents/qa-tester.md`. Each file has YAML frontmatter with `name`, `description`, `tools` and `model: inherit`, followed by the brief as the body. If your tool cannot spawn subagents, run the three roles sequentially yourself, and announce each hat change explicitly ("Switching to QA Tester role").

### 2.2 Phases and gates

```
Phase 0  Orchestrator: read repo + this doc, restructure repo (§3), verify toolchain
Phase 1  Planner → docs/PLAN.md            → Orchestrator reviews vs §1 (all M-IDs mapped)
Phase 2  Designer M1  Scaffold, tokens, typography, ALL content static, no animation
         QA Gate 1    content parity, typography parity, links, a11y basics, build/export
Phase 3  Designer M2  Motion system, Lenis/GSAP choreography, pop-ups, consoles, widget, mobile sheet, DOM gallery + lightbox
         QA Gate 2    interactions, focus management, reduced motion, no stuck-invisible content
Phase 4  Designer M3  3D: Cosmos, Orbit Gallery, quality tiers, fallbacks, motion toggle
         QA Gate 3    WebGL on/off/lost, perf budgets, visual review, gallery input
Phase 5  Designer M4  Deploy pipeline, .htaccess, image pipeline polish, SEO, README
         QA Gate 4    FULL regression of every M-ID + Lighthouse + deploy dry-run
Phase 6  Orchestrator: final report to Nonso (§19)
```

### 2.3 Gate rules

- At every gate, the QA Tester runs the full checks for that gate plus everything from earlier gates (regression), and writes `docs/QA-REPORT.md` (overwrite, keep a short history table at the bottom).
- Severity:
  - **Blocker:** a broken build, a broken WhatsApp link, lost content, a crash, or an inaccessible pop-up.
  - **Major:** an M-ID failure, a budget miss, a visual bug at a common width, or a fallback failure.
  - **Minor:** polish.
- A gate passes only with **0 Blockers and 0 Majors**. Minors are listed and may roll forward.
- Fix loop: the Designer fixes, writes `docs/HANDOFF-Mx.md` (what changed, how to verify, known gaps), and QA re-runs. If the same issue fails 3 times, the Orchestrator steps in, reads the code, and decides the fix.
- **Branching:** do all work on a branch called `rebuild`.
  - Commit after each passed gate, using a conventional message (`feat: M2 motion system and consoles (QA gate 2 passed)`). Pushing `rebuild` is fine; it deploys nothing.
  - Merge `rebuild` into `main` **only after Gate 4 passes**. A push to `main` is what publishes the site.
  - Never push the `deploy` branch by hand.

### 2.4 When to stop and ask Nonso

Only for decisions that cannot be undone or that need a fact only Wale has. Do **not** stop for design choices this document leaves open. Decide those and log them in `docs/DECISIONS.md`. Facts only Wale has are already handled by placeholders and flags (§6.1), so they never block the build.

### 2.5 Role briefs (pass verbatim)

#### PLANNER

```
You are the Planner for the Wale "Brass Cosmos" rebuild. Read docs/BUILD-PROMPT.md in
full, then read the legacy page (legacy/index.html) and the repo tree. You do NOT write
application code.

Produce docs/PLAN.md with these sections:
1. Architecture summary (static export, why, constraints from §4.3).
2. Final file tree (from §4.4, adjusted only with justification).
3. Dependency list with exact versions you verified with `npm view <pkg> version` and
   peer-dependency compatibility (react/three/fiber/drei/postprocessing must resolve
   with plain `npm install` — no --force, no --legacy-peer-deps).
4. Component inventory: name, file, server or client component, props, which content
   keys it reads from src/content/site.ts, which M-IDs it serves.
5. Section-by-section build spec (§7) with the motion beats per section (§10).
6. 3D plan (§8): scenes, uniforms, tier behaviour, fallbacks, memory/cleanup strategy.
7. Pop-up plan (§9): focus management, Lenis stop/start, scroll lock, return focus.
8. Performance plan and budgets (§12): what loads when, chunk boundaries.
9. Deployment plan (§15) — files and the one-time Hostinger steps.
10. Risk register: top 12 risks with likelihood, impact, mitigation (start from §17).
11. Milestones M1–M4 broken into ordered tasks, each with acceptance criteria.
12. Traceability matrix: every M-ID (§1) → task(s) → test(s) in §16. No gaps allowed.

Flag anything in BUILD-PROMPT.md that is contradictory or impossible, with a proposed
resolution, at the top of PLAN.md under "Open questions". Keep PLAN.md concrete:
file names, component names, numbers. No filler.
```

#### FRONTEND DESIGNER

```
You are the Frontend Designer (designer + engineer) for the Wale "Brass Cosmos"
rebuild. Read docs/BUILD-PROMPT.md and docs/PLAN.md in full before writing code.
You implement milestone by milestone (M1 → M4) exactly as planned.

Rules:
- Copy comes only from src/content/site.ts, transcribed exactly from §6. Never invent
  facts, numbers, reviews or prices (M-09).
- Typography is sacred (M-01, §5.4). Check your work against legacy/index.html.
- Follow the motion principles in §10 (springs, interruptible, respond on press,
  spatial consistency, reduced motion). Read §17 Known pitfalls before each milestone.
- Every interactive thing is a real <button>, <a href> or labelled <input>.
- Cross-platform npm scripts only (Nonso develops on Windows).
- Before every handoff: run `npm run lint`, `npm run build`, `npm run typecheck`,
  `node scripts/prepare-deploy.mjs`; fix everything; then self-review the milestone's
  sections at 390px and 1440px using screenshots (Playwright) and compare with §5 and §7.
- Write docs/HANDOFF-Mx.md: what you built, how to verify, known gaps, decisions
  (also append decisions to docs/DECISIONS.md).
- You may not mark QA items as passed or edit tests to make them pass. If you believe
  a test is wrong, say so in the handoff and let the Orchestrator decide.
- Commit after each passed QA gate with a conventional commit message.
```

#### QA TESTER

```
You are the QA Tester for the Wale "Brass Cosmos" rebuild. You are independent: you
did not build this, and your job is to find what is wrong before real clients do.
Read docs/BUILD-PROMPT.md (especially §1, §16, §17) and docs/PLAN.md.

You may only add/modify: tests/**, playwright.config.ts, lighthouserc.json,
docs/QA-REPORT.md, qa/** (screenshots, gitignored). You never edit application code.

At each gate:
1. Clean build exactly like CI: delete node_modules, .next and out (with a Node
   one-liner or rimraf, not rm -rf in npm scripts), then `npm ci`, `npm run lint`,
   `npm run build`, `npm run typecheck`, `node scripts/prepare-deploy.mjs`.
2. Serve out/ statically (`npx serve out -l 4173`) and run the Playwright suite (§16.2)
   against http://localhost:4173 — the exported files, never `next dev`.
3. Run axe on the page and with every pop-up open; Lighthouse at Gate 4 (§16.3).
4. Take the screenshot matrix (§16.4) and LOOK at every screenshot. Compare with the
   art direction (§5) and section specs (§7). Typography must match legacy/index.html
   (§16.2 typography parity test).
5. Write docs/QA-REPORT.md: a PASS/FAIL table for every M-ID and every test in §16,
   then issues with severity (Blocker/Major/Minor), exact repro steps, expected vs
   actual, screenshot paths. End with: GATE PASSED or GATE FAILED.

Be strict. "Mostly works" is a FAIL. Never weaken an assertion to make it pass; if a
requirement is impossible, report it to the Orchestrator with evidence.
```

---

## 3. Starting point and repo restructure (Phase 0, exact steps)

The repo currently contains `index.html` (the legacy page), `images/` (11 JPGs) and `README.md`. Restructure **before** scaffolding:

```bash
# 1. Preserve the legacy page as the typography/visual reference
git mv index.html legacy/index.html
git mv images legacy/images
# legacy/index.html references images/… relatively, so it still works from legacy/

# 2. Scaffold Next.js into a temporary folder (non-interactive).
#    The folder name becomes the npm package name, so it must be a valid npm name:
#    no leading dot, lowercase.
npx create-next-app@16.4.2 wale-scaffold --ts --tailwind --eslint --app --src-dir \
  --import-alias "@/*" --use-npm --disable-git --no-react-compiler --no-agents-md --empty --yes

# 3. Move everything from wale-scaffold/ into the repo root (it contains no .git), then
#    delete wale-scaffold/. Use a Node one-liner or your file tools (cross-platform).
#    Set "name": "wale-sax" in package.json. Overwrite README.md (you rewrite it in M4).
#    Merge .gitignore: keep the scaffold's (it ignores /.next/, /out/, next-env.d.ts, .env*)
#    and add: /public/_img/  /qa/  /playwright-report/  /test-results/  /.lighthouseci/

# 4. Copy the photos into the new source-of-truth folder (same names)
#    legacy/images/*.jpg  →  public/images/*.jpg
```

Then:

- Delete the scaffold's sample `public/*.svg` files and its default favicon. You will add `src/app/icon.svg` (§13).
- Add `.nvmrc` containing `22`.
- Add `.gitattributes` containing `* text=auto eol=lf`.
- Keep TypeScript **5.x** and ESLint **9.x** exactly as `create-next-app@16` installs them. **Do not upgrade to TypeScript 7 or ESLint 10.**

The legacy images, and what they are:

| File | Content |
|---|---|
| `wale-hero.jpg` | **Real photo** (Efizzy Studios): Wale in a black pinstripe double-breasted suit, coral bow tie and pocket square, holding a gold alto saxophone. Near-black background with a wine-red glow bottom-left. He looks to his left (screen-left). 1200×1553. |
| `wale-sax-detail.jpg` | **Real photo:** close crop of his hands on the bell of the gold sax. 680×850. |
| `occ-weddings.jpg`, `occ-birthdays.jpg`, `occ-proposals.jpg`, `occ-dinners.jpg` | Placeholders ("REPLACE IMAGE" cards), 800×1000, 4:5. |
| `gal-video.jpg` | Placeholder, 1600×900, 16:9 (video poster). |
| `gal-1.jpg` … `gal-4.jpg` | Placeholders, 900×900, 1:1. |

---

## 4. Architecture and stack

### 4.1 Why a static export (the Hostinger reason)

Nonso's previous React project sat on a Laravel base, and he had to run the build on his own machine before every push. This project removes that entirely:

- Next.js `output: 'export'` produces plain files in `out/`, which any Hostinger plan can serve. No Node process on the server, no PHP, no SSH builds.
- **GitHub Actions** runs `npm ci && npm run build` on every push to `main`, then commits the contents of `out/` to a branch called **`deploy`**.
- Hostinger's **Git** integration (hPanel → Advanced → Git → Connect with GitHub) watches the `deploy` branch and auto-deploys it into `public_html`.
- Result: edit → push (or edit in the GitHub web UI) → live in a few minutes. No local build, ever.

Hostinger's Node.js web-app hosting is **not** needed, and must not be required.

### 4.2 Baseline versions (verified on npm, 22 Oct 2026)

Install the latest stable of each. These are the known-good baseline, and every peer range below was checked and resolves with plain `npm install`. Record the exact installed versions in `docs/PLAN.md`.

| Package | Baseline | Notes |
|---|---|---|
| `next` | 16.4.2 | App Router, Turbopack default; needs Node ≥ 20.9 |
| `react`, `react-dom` | 19.3.1 | R3F 9.8 peer range is `>=19 <19.4` |
| `typescript` | 5.x (from create-next-app) | **Not** 7.x |
| `eslint` / `eslint-config-next` | 9.x / 16.4.2 | Flat config from the scaffold; lint script is `eslint` |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.x | CSS-first config (`@theme` in `globals.css`), no `tailwind.config.js` |
| `three` | 0.186.x | Import addons from `three/addons/...` |
| `@react-three/fiber` | 9.8.x | |
| `@react-three/drei` | 10.7.x | |
| `@react-three/postprocessing` / `postprocessing` | 3.2.x / 6.39.x | High tier only |
| `maath` | 0.10.x | Damping helpers |
| `gsap` / `@gsap/react` | 3.15.x / 2.1.x | ScrollTrigger + SplitText (included free in `gsap`) |
| `lenis` | 1.3.x | `lenis/react` → `ReactLenis`, `useLenis`; CSS `lenis/dist/lenis.css` |
| `motion` | 14.x | `motion/react` for springs, `AnimatePresence`, layout |
| `@radix-ui/react-dialog` | 1.3.x | Accessible modals (focus trap, Esc, aria) |
| `simple-icons` | 16.x | WhatsApp and Instagram glyph paths only (`siWhatsapp`, `siInstagram`) |
| `sharp` | 0.35.x | devDependency: image pipeline |
| `@playwright/test` / `@axe-core/playwright` | 1.64.x / 4.14.x | devDependencies |
| `@lhci/cli` | 0.15.x | devDependency |
| `serve` | 14.2.x | devDependency: `npm run preview` |

Never use `--force` or `--legacy-peer-deps`. If a peer conflict appears, pick compatible versions and log it in `docs/DECISIONS.md`.

### 4.3 Static-export rules

**Allowed:**

- Server Components rendered at build time, including reading files with `fs` at build.
- Client Components.
- `next/font/google`, which downloads fonts at build and self-hosts them.
- Metadata API.
- `app/robots.ts` and `app/sitemap.ts` with `export const dynamic = 'force-static'`.
- `app/not-found.tsx`, which becomes `out/404.html`.

**Forbidden** (these break `output: 'export'`):

- Server Actions, middleware, `cookies()`/`headers()`, ISR/revalidate.
- Rewrites, redirects or headers in `next.config` (use `.htaccess` instead).
- `next/image` optimization (set `images.unoptimized: true`; we use our own `<Picture>`).
- Dynamic route handlers.
- Any API route that runs at request time.

### 4.4 File tree (target)

```
.github/workflows/deploy.yml          # §15.2 (verbatim)
.claude/agents/{planner,frontend-designer,qa-tester}.md
deploy/htaccess-root                  # §15.3 (verbatim)
deploy/htaccess-static                # §15.3 (verbatim)
docs/BUILD-PROMPT.md  PLAN.md  DECISIONS.md  QA-REPORT.md  HANDOFF-M1..M4.md
legacy/index.html  legacy/images/*    # untouched reference
public/images/*.jpg                   # SOURCE OF TRUTH photos (replace by same name)
public/audio/                         # optional: wale-sample.mp3 (see §8.6)
public/videos/                        # optional: self-hosted performance video
scripts/optimize-images.mjs           # §14
scripts/prepare-deploy.mjs            # §15.4 (verbatim)
src/app/layout.tsx  page.tsx  not-found.tsx  globals.css  icon.svg  robots.ts  sitemap.ts
src/content/site.ts                   # ALL copy, links, flags (§6)
src/lib/whatsapp.ts                   # message templates + link builder (§9.6)
src/lib/images.ts                     # build-time manifest reader (server only)
src/lib/motion-preference.ts          # OS reduced-motion + user toggle store
src/lib/quality-tier.ts               # tier detection (§8.1)
src/components/layout/  Nav, MobileSheet, Footer, SkipLink, MotionToggle, ScrollProgress
src/components/sections/ Hero, Paths, ChapterMarker, WhyLive, Occasions, PullQuote,
                         BookingSteps, Testimonials, Coverage, LessonsIntro, LessonsPAS,
                         LessonsWho, LessonsPath, LessonsFormats, Gallery, Faq, FinalCta
src/components/overlays/ ContactMenu, WhatsAppWidget, BookingConsole, LessonsConsole,
                         Lightbox, ConsoleProvider (context to open consoles from any CTA)
src/components/ui/       Button, Picture, Eyebrow, SectionHeading, Chip, HudFrame, Magnetic,
                         CursorFollower, Accordion
src/components/three/    CosmosCanvas, Cosmos (particles, ribbon), OrbitGallery,
                         shaders/*.ts (GLSL as template strings), useQualityTier
src/components/providers/ SmoothScroll (Lenis + GSAP), MotionProvider
tests/                   Playwright specs (§16)
playwright.config.ts  lighthouserc.json  .nvmrc  .gitattributes  next.config.ts
```

### 4.5 Config files

`next.config.ts`, verbatim:

```ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
```

Do **not** set `basePath`. The site is served at the domain root (or a subdomain root). Do not set `trailingSlash`: it is a single page, and `out/404.html` must exist at the root.

`package.json` scripts, all cross-platform:

```json
{
  "scripts": {
    "images": "node scripts/optimize-images.mjs",
    "predev": "node scripts/optimize-images.mjs",
    "dev": "next dev",
    "prebuild": "node scripts/optimize-images.mjs",
    "build": "next build",
    "typecheck": "tsc --noEmit",
    "lint": "eslint",
    "prepare-deploy": "node scripts/prepare-deploy.mjs",
    "preview": "serve out -l 4173",
    "test:e2e": "playwright test",
    "lhci": "lhci autorun"
  }
}
```

`typecheck` runs **after** `build` in CI. `next-env.d.ts` is gitignored and generated by the build.

---

## 5. Art direction: "Brass Cosmos"

### 5.1 Concept

*A midnight jazz club adrift in deep space.* The black velvet of the legacy page becomes an endless void. The brass of his saxophone becomes stardust. The wine-red glow behind him in the portrait becomes nebulae. His pinstripe suit becomes vertical "light rails". Thin brass hairlines with corner ticks become a restrained heads-up display.

Everything stays elegant and warm. It is **luxury sci-fi**, not gamer sci-fi. The hero portrait emerges out of the void: its near-black background dissolves into the cosmos through a soft edge mask.

**The one thing people remember:** the Orbit Gallery. A ring of holographic screens circles a glowing brass core, and you can fling it around with your finger.

### 5.2 Do and don't

**Do:**

- deep blacks
- brass-gold light
- wine-red nebula haze
- vertical pinstripe rails
- hairline HUD frames with L-shaped corner ticks
- generous negative space
- slow, weighty, physical motion
- one hero moment per section
- italic Bodoni words in brass as the emotional accent

**Don't:**

- neon cyan/magenta UI
- purple gradients
- rainbow/chromatic glows on UI (RGB split is allowed only inside the 3D gallery shader)
- glass blur on large areas
- left-border accent cards
- emoji
- sci-fi fonts
- 3D text
- scroll-jacking that fights the user
- pinned sections on mobile
- autoplaying sound
- anything that blinks

### 5.3 Colour tokens

Define these in `globals.css` (`:root`) and expose them to Tailwind with `@theme inline`. No other UI colours.

| Token | Value | Use |
|---|---|---|
| `--ink-0` | `#0A090B` | Page ground / void |
| `--ink-1` | `#0D0B0D` | Deep sections |
| `--ink-2` | `#141215` | Raised panels, cards (use at 80–92% alpha over the cosmos) |
| `--ink-3` | `#1C1A1E` | Image wells, inputs |
| `--ivory` | `#F4EFE6` | Primary text |
| `--ivory-2` | `#E6DED2` | Chip text |
| `--mist` | `#C9C0B5` | Lead paragraphs |
| `--muted` | `#B8AFA4` | Secondary body text |
| `--faint` | `#968D82` | Captions, microcopy (min 13px) |
| `--brass` | `#D4A64A` | Accent, primary buttons, italic emphasis |
| `--brass-hi` | `#E2BE6E` | Highlights, hover |
| `--brass-ink` | `#16110A` | Text on brass buttons |
| `--coral` | `#EE8A73` | The tiny "live" dot only (from his bow tie) |
| `--wine` | `rgb(122 14 34)` | Nebula glows only (never text or fills) |
| `--wa` | `#25D366` | WhatsApp button only |
| `--hairline` | `rgb(244 239 230 / 0.08)` | Dividers (also 0.10, 0.12, 0.16, 0.22 for stronger lines) |

The 3D scenes may use tints derived from brass, ivory and wine, and the natural colour fringes of the RGB-split shader. No new hues.

### 5.4 Typography (exact, from the legacy page)

Load both fonts with `next/font/google` in `src/app/layout.tsx`, as variable fonts:

```ts
import { Bodoni_Moda, Instrument_Sans } from 'next/font/google';

const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],            // verified: Bodoni Moda has opsz 6–96 and wght 400–900
  display: 'swap',
  variable: '--font-bodoni',
});
const instrument = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument',
});
// <html lang="en-NG" suppressHydrationWarning className={`${bodoni.variable} ${instrument.variable}`}>
// (suppressHydrationWarning only because the tiny inline script in §10.4 sets data-motion before paint)
```

In `globals.css`:

```css
@theme inline {
  --font-display: var(--font-bodoni), Didot, "Bodoni 72", Georgia, serif;
  --font-sans: var(--font-instrument), ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
}
```

The CSS variable names **must** differ from the Tailwind theme names. If `next/font` used `--font-display`, the theme would reference itself and break.

Body defaults: Instrument Sans, 16px, line-height 1.5, `-webkit-font-smoothing: antialiased`, `font-optical-sizing: auto`, `text-wrap: pretty` on paragraphs and `balance` on headings.

| Role | Family | Weight / style | Size | Line-height | Tracking | Colour |
|---|---|---|---|---|---|---|
| Wordmark "Wale" | Bodoni Moda | 600 italic | 28px nav / 24px footer | 1 | −0.01em | ivory |
| Wordmark label "Saxophonist" | Instrument Sans | 600, uppercase | 11px | — | 0.24em | muted |
| Eyebrow | Instrument Sans | 600, uppercase | 12px | — | 0.22em | brass (hero: muted, with coral dot) |
| H1 | Bodoni Moda | 500 | `clamp(3rem, 6.2vw, 5.6rem)` | 0.98 | −0.025em | ivory; emphasis word italic brass |
| H2 | Bodoni Moda | 500 | `clamp(2.25rem, 4.2vw, 3.6rem)` | 1.04 | −0.02em | ivory; emphasis italic brass |
| H2 (final CTA) | Bodoni Moda | 500 | `clamp(2.6rem, 5.4vw, 4.6rem)` | 1.0 | −0.025em | ivory |
| Card title (occasions, formats) | Bodoni Moda | 500 | 26px | 1.15 | −0.01em | ivory |
| H3 (features, steps, who-for) | Instrument Sans | 600 | 19px | 1.3 | −0.01em | ivory |
| Index numerals "01" | Bodoni Moda | italic | 18px (features) / 48px (steps) | 1 | — | brass |
| Stat value | Bodoni Moda | 500 | 32px | 1.1 | — | brass; `font-variant-numeric: lining-nums` |
| Stat label | Instrument Sans | 400 | 13px | — | 0.04em | faint |
| Lead paragraph | Instrument Sans | 400 | `clamp(1.05rem, 1.35vw, 1.2rem)` | 1.6 | 0 | mist |
| Body (sections) | Instrument Sans | 400 | 17px | 1.7 | 0 | muted |
| Emphasis paragraph | Instrument Sans | 400 | 20px | 1.6 | 0 | ivory |
| Body (cards) | Instrument Sans | 400 | 15px | 1.6–1.65 | 0 | muted |
| Pull quote | Bodoni Moda | 400 italic | `clamp(1.6rem, 3vw, 2.4rem)` | 1.3 | −0.01em | ivory |
| Testimonial quote | Bodoni Moda | 400 italic | 21px | 1.45 | 0 | ivory |
| Caption / figcaption | Instrument Sans | 600, uppercase | 12px | — | 0.2em | faint |
| Chip | Instrument Sans | 400 | 14px | — | 0 | ivory-2 |
| Button | Instrument Sans | 600 | 14 / 15 / 16 / 17px (sizes S/M/L/XL) | — | 0 | brass-ink on brass, or ivory on outline |
| FAQ question | Instrument Sans | 500 | 18px | 1.4 | 0 | ivory |
| Nav links | Instrument Sans | 400 | 14px | — | 0 | muted → ivory on hover |

On phones (< 640px), no headline may break into a lone word on its own line where `text-wrap: balance` can prevent it. Check at 320, 360 and 390px.

### 5.5 Layout and spacing

- **Container:** `max-width: 1200px; margin-inline: auto; padding-inline: clamp(16px, 4vw, 40px)`.
- **Section rhythm:** `padding-block: clamp(72px, 8vw, 112px)`. The final CTA uses `clamp(88px, 10vw, 136px)`.
- **Radii:** images 4px; gallery tiles 6px; cards and panels 8px; inputs 10px; buttons and chips 999px; modals 16px.
- **Buttons:** heights 44 / 48 / 56 / 60px; pill shape; primary = brass fill with brass-ink text and a soft brass shadow `0 12px 32px -12px rgb(212 166 74 / .6)`; secondary = 1px `rgb(244 239 230 / .22)` outline with ivory text.
- **Grids:** `repeat(auto-fit, minmax(min(<min>px, 100%), 1fr))` so they collapse to one column on phones without overflow.
- **Background colour:** sections are mostly transparent so the cosmos shows through. Panels and cards use `--ink-2` at 80–92% opacity. Blur (`backdrop-filter`) is allowed only on small surfaces (nav, widget panel, contact menu, modals, gallery HUD chips) and only on the high tier. Lower tiers use a solid `--ink-2` at 94%.
- **Wrappers:** use `overflow-x: clip`, never `overflow: hidden`, so `position: sticky` keeps working.

### 5.6 Motifs

- **Light rails:** `repeating-linear-gradient(90deg, rgb(244 239 230 / .035) 0 1px, transparent 1px 22px)` on hero, coverage and final CTA backgrounds. In the hero they "draw in" from the top on load.
- **HUD frame:** 1px brass hairline L-shaped corner ticks (14–18px legs, inset 0). Used on the hero portrait, gallery viewport, console panels and the lightbox. Never full rectangles.
- **Nebula glows:** large soft radial gradients of `--wine` at 40–55% opacity, positioned off-canvas, never behind body text at more than 25% intensity.
- **Live dot:** an 8px coral dot before the hero eyebrow, with a slow 2.4s opacity breathe (off when motion is off).
- **Scroll progress:** a 1px brass hairline at the bottom edge of the sticky nav.

### 5.7 Icons

Use inline stroke SVGs (1.8–2px stroke, round caps), sized 16–24px, `aria-hidden="true"` when decorative. Use the WhatsApp and Instagram glyphs from `simple-icons` (`siWhatsapp.path`, `siInstagram.path`, 24×24 viewBox). WhatsApp's brand guidelines permit the glyph on click-to-chat links. No icon fonts, no emoji.

---

## 6. Content (transcribe into `src/content/site.ts` exactly)

### 6.1 Placeholder and flag policy

- **`[BRACKETS]`** mark facts only Wale can give: numbers, client words, handles. They render visibly as written, in the same style as real copy. Testimonial cards that are still placeholders get a **dashed** brass border (`1px dashed rgb(212 166 74 / .4)`); real ones get a solid hairline. Each card has a `placeholder: boolean`.
- **`null` values** hide the element or switch to the launch-safe fallback text written next to each field below. A launch-safe fallback contains no brackets and no claims.
- **Flags marked CONFIRM** default to the most likely truth. The README's "Before launch: confirm with Wale" list names every one.
- Use typographic apostrophes and quotes (’ “ ”) in all copy. This also avoids ESLint's `react/no-unescaped-entities`.

### 6.2 `site.ts` shape (minimum; extend if needed, keep the names)

```ts
export const site = {
  siteUrl: 'https://YOUR-DOMAIN.com',          // CONFIRM before launch (used for canonical/OG/sitemap)
  name: 'Wale',
  fullName: null as string | null,              // e.g. 'Wale Adebayo' — shown in footer/JSON-LD if set
  role: 'Saxophonist',
  base: 'Ajah, Lagos',
  whatsapp: { number: '2347040149133', display: '0704 014 9133' },
  phoneHref: 'tel:+2347040149133',
  instagram: { handle: null as string | null, url: null as string | null }, // null → shows “[@handle]” as plain text
  photoCredit: 'Portrait by Efizzy Studios',
  stats: [
    { value: '[00]+', label: 'events played' },
    { value: '[00]+', label: 'students taught' },
    { value: '[0] years', label: 'on stage' },
  ],
  performance: {
    startingPrice: null as string | null,       // e.g. '₦150,000' → adds “Packages start from ₦150,000.” to the price FAQ
    bringsSound: null as null | 'own' | 'venue' | 'either', // null hides that FAQ item
    genres: ['Afrobeats', 'Highlife', 'Gospel & worship', 'Jazz standards', 'R&B & soul', 'Amapiano'], // CONFIRM
  },
  lessons: {
    home: true,          // CONFIRM: teaches at the student's home in Lagos
    online: false,       // CONFIRM: video-call lessons
    group: false,        // CONFIRM: siblings/friends/church band together
    youngLearners: { enabled: true, minAge: null as number | null }, // CONFIRM
    lessonLength: null as string | null,   // e.g. '60 minutes'
    price: null as string | null,          // e.g. '₦40,000 / month · 4 lessons'
    trial: null as string | null,          // e.g. 'First lesson free' or 'Trial lesson ₦10,000'
    advisesOnInstruments: true,            // CONFIRM: will tell students what sax to buy
  },
  areas: ['Ajah','Lekki','Sangotedo','Ibeju-Lekki','Victoria Island','Ikoyi','Yaba','Surulere','Ikeja','Magodo','Festac'],
  audioSample: null as string | null,      // e.g. '/audio/wale-sample.mp3' → enables §8.6
  gallery: [
    { id: 'live-video', kind: 'video', image: 'gal-video.jpg', alt: 'Wale performing live', caption: 'Live set', videoSrc: null as string | null, externalUrl: null as string | null },
    { id: 'live-1', kind: 'photo', image: 'gal-1.jpg', alt: 'Wale performing live', caption: '[Event, area]' },
    { id: 'live-2', kind: 'photo', image: 'gal-2.jpg', alt: 'Wale performing live', caption: '[Event, area]' },
    { id: 'live-3', kind: 'photo', image: 'gal-3.jpg', alt: 'Wale performing live', caption: '[Event, area]' },
    { id: 'live-4', kind: 'photo', image: 'gal-4.jpg', alt: 'Wale performing live', caption: '[Event, area]' },
  ],
  // …all section copy below, keyed by section
} as const;
```

If `as const` inference gets awkward with the nullable fields and mixed gallery items, declare a `SiteContent` interface and annotate `site` with it instead. The field names and values above stay the same.

The gallery accepts 1–40 items. The README explains how to add a new image and entry. A `video` item with neither `videoSrc` nor `externalUrl` behaves like a photo (no play affordance).

### 6.3 Global elements

**Nav**

- Wordmark "Wale" + "Saxophonist".
- Links: **Performances** (`#performances`), **Lessons** (`#lessons`), **Gallery** (`#gallery`), **FAQ** (`#faq`).
- Button: **Message Wale**. It opens the Contact Menu (§9.4) anchored to the button. No JS: `href` = the general WhatsApp link.
- Mobile (< 860px): wordmark + **Message Wale** + a **Menu** button that opens the Mobile Sheet (§9.7) with the four links.

**WhatsApp widget** (bottom-right, every page state)

- Label chip (≥ 640px only): **Chat with Wale**.
- Panel title: **Wale · Saxophonist**. Status line: **Replies on WhatsApp**.
- Options (each an `<a>`):
  1. **Book a performance** (booking template)
  2. **Ask about lessons** (lessons template)
  3. **Just a question** (general template)

**Footer**

- "Wale" (+ `fullName` if set).
- **Live saxophonist & teacher · Ajah, Lagos · Plays and teaches anywhere in Lagos**
- Links: **WhatsApp · 0704 014 9133**; **Instagram · [@handle]** (a link only when `instagram.url` is set); **Motion: On/Off** toggle; **© 2026 · Portrait by Efizzy Studios**.

### 6.4 Hero (`#top`)

- **Eyebrow:** Live saxophonist & teacher · Ajah, Lagos *(coral live dot before it)*
- **H1:** Live saxophone, *delivered* to your door. *("delivered" italic brass; author each word as its own `<span>` for the CSS intro, see §7.1)*
- **Lead:** Book Wale to play your wedding, birthday or dinner — or learn to play yourself, with one-on-one lessons at home. Anywhere in Lagos.
- **Primary CTA (L, brass):** Book Wale for your event → Booking Console
- **Secondary CTA (L, outline):** Start saxophone lessons → Lessons Console
- **Microcopy:** Both start with one WhatsApp message.
- **Stats row:** the three `site.stats`, separated by a hairline above.
- **Image:** `wale-hero.jpg`. Alt: "Wale in a black pinstripe suit and coral bow tie, holding a gold alto saxophone".

### 6.5 Paths (`#paths`)

- **Eyebrow:** Two ways in
- **H2:** Two ways to bring the saxophone *home.*
- **Card 1:**
  - Label: 01 · Performances
  - Title: **Hear him live**
  - Body: Weddings, birthdays, proposals, dinners and church events. He arrives suited, plays your moments on cue, and leaves your guests talking.
  - Link: Explore performances → `#performances`
- **Card 2:**
  - Label: 02 · Lessons
  - Title: **Learn to play**
  - Body: One-on-one saxophone lessons in your own living room — for complete beginners, young learners and church instrumentalists.
  - Link: Explore lessons → `#lessons`
  - If `youngLearners.enabled` is false, drop "young learners and".

### 6.6 Chapter I — Performances (`#performances`)

**Chapter marker:** I · Performances

**Why live sax**

- **Eyebrow:** Why live sax
- **H2:** Every party has a playlist. Yours can have a *moment.*
- **P (muted):** You know the kind of event. Same speaker, same playlist as the last three you went to, and half the guests are on their phones before the small chops run out. A week later, nobody remembers it.
- **P (emphasis, ivory):** Then a saxophonist walks in playing the celebrant’s favourite song — and the whole room turns around. The phones come out again, this time to film. That is the moment people carry home.
- **Features:**
  - **01 Fits any room.** One performer, minimal setup. A corner of your living room is enough of a stage.
  - **02 Plays to your crowd.** Afrobeats for the dancers, highlife for the uncles, worship for the thanksgiving, smooth jazz for the dinner.
  - **03 Hits your cues.** The entrance, the cake, the “yes”. Tell him the moment and he plays it right on time.

**Occasions** (`#occasions`)

- **Eyebrow:** Occasions
- **H2:** Wherever there’s something to celebrate.
- **Cards** (image 4:5, title, body):
  - `occ-weddings.jpg`. **Weddings.** The walk down the aisle, the grand entrance, the first dance — live, and timed to the second.
  - `occ-birthdays.jpg`. **Birthdays & surprises.** He walks in playing their favourite song. You get to watch their face.
  - `occ-proposals.jpg`. **Proposals & anniversaries.** A private serenade at home or over dinner, for the question that matters most.
  - `occ-dinners.jpg`. **Dinners, launches & lounges.** Smooth live jazz that keeps guests at the table — for corporate nights, restaurants and beach clubs.
  - Image alts, in the same order: "Wale playing at a wedding", "Wale surprising a birthday celebrant", "Wale serenading a couple at a proposal", "Wale playing at a dinner".
- **Footer line:** Also thanksgiving services, naming ceremonies, graduations, house parties and album launches. If there are guests, he can play it.
- **Button (outline):** Ask about your event → Booking Console

**Pull quote** (placeholder)

> “[A client’s words about the moment Wale walked in — ask a happy client for two sentences and paste them here.]”

Caption: [Client name] · [Occasion], [Area]

**Booking steps** (`#booking-steps`)

- **Eyebrow:** How booking works
- **H2:** Booked in three messages.
- **Steps:**
  1. **Send your date & location.** One WhatsApp message: when, where, and what you’re celebrating.
  2. **Choose your songs.** Tell him the moments that matter and the songs that matter to you. Not sure? He’ll suggest a set for your crowd.
  3. **He arrives and plays.** Dressed for the occasion and ready to go. You get to enjoy your own event.
- **Genres row:** label "He plays", then the `performance.genres` chips, then a highlighted brass chip **Your song**.

**Host testimonials** (`#hosts`; three placeholder cards)

- **Eyebrow:** Kind words
- **H2:** What hosts say after the night.
- **Card 1:** “[Before Wale: what they were worried about. After: what their guests said when he started playing.]”. [Client name] · [Wedding · Lekki]
- **Card 2:** “[The surprise moment: who it was for, how they reacted, what it meant.]”. [Client name] · [Birthday · Ikoyi]
- **Card 3:** “[Why they would book him again, or who they have already recommended him to.]”. [Client name] · [Corporate dinner · Victoria Island]

### 6.7 Coverage bridge (`#coverage`)

- **Eyebrow:** Home delivery
- **H2:** Based in Ajah. *Plays — and teaches — anywhere.*
- **P:** You don’t go to the music — the music comes to you. Your living room, your rooftop, the church hall, the hotel ballroom.
- **P:** Lessons work the same way: Wale comes to your home, so Lagos traffic never stands between you and your practice. *(Show only if `lessons.home` is true.)*
- **Area chips:** `site.areas`, then a highlighted chip: …and everywhere in between
- **Note:** Outside Lagos? Send the location and ask.
- **Constellation caption** (small, faint): Stylised map — not to scale.

### 6.8 Chapter II — Lessons (`#lessons`)

**Chapter marker:** II · Lessons

**Lessons intro**

- **Eyebrow:** Saxophone lessons
- **H2:** Learn the saxophone from someone who *plays it for a living.*
- **Lead:** One-on-one lessons at your home in Lagos. Start from zero, or finally fix the habits YouTube taught you.
  - If `home` is false and `online` is true: "One-on-one lessons by video call, wherever you are."
  - If both are true: "One-on-one lessons at your home in Lagos, or by video call."
- **Primary CTA (brass):** Book a trial lesson → Lessons Console
- **Microcopy:** if `lessons.trial` is set, "{trial} · Send your level and area on WhatsApp." Otherwise "Send your level and area on WhatsApp — Wale will suggest a plan."
- **Image:** `wale-sax-detail.jpg`. Alt: "Close-up of Wale’s hands on the bell of his gold saxophone".

**Lessons PAS** (`#lessons-why`)

- **Eyebrow:** Sound familiar?
- **H2:** The saxophone isn’t hard. *Learning it alone is.*
- **P1 (muted):** You’ve wanted to play for years. Maybe there’s a saxophone in your house right now, sitting in its case.
- **P2 (muted):** So you try YouTube. You get a squeak, a sore lip and a lot of frustration — and nobody there to tell you why. The wrong habit sets in, progress stops, and the case closes for another year.
- **P3 (emphasis, ivory):** Lessons with Wale fix that from the first session. He sits beside you, hears every note and corrects it on the spot. Then he teaches you the songs you actually want to play — not just exercises.

**Who it’s for** (`#lessons-who`)

- **Eyebrow:** Who it’s for
- **H2:** Built for where you’re *starting from.*
- **Cards:**
  - **Complete beginners.** Never held a saxophone? You start at the beginning: how to hold it, how to breathe, your first notes.
  - **Young learners.** Patient, structured lessons that keep children and teens practising — and proud to play for the family. *(Only if `youngLearners.enabled`. If `minAge` is set, append " From age {minAge}.")*
  - **Church & choir instrumentalists.** Learn to play hymns and praise songs by ear, follow the key the choir is in, and lead with confidence on Sunday.
  - **Players who want more.** Already play? Work on tone, runs, improvisation and the Afrobeats, highlife and jazz lines you hear on stage.

**Learning path** (`#lessons-path`)

- **Eyebrow:** The path
- **H2:** From first note to *first performance.*
- **Intro:** Every student moves at their own pace. This is the road.
- **Stages:**
  - **01 First sound.** Posture, breathing and embouchure. Clean, steady notes before anything else.
  - **02 First song.** A full song you choose, played start to finish. This is where it gets fun.
  - **03 Read & hear.** Reading music, scales, and the skill most self-taught players never get: playing by ear.
  - **04 Play out.** Improvising, playing with backing tracks, and performing for real people — family, church, your first event.

**Formats** (`#lessons-formats`)

- **Eyebrow:** Lesson formats
- **H2:** Lessons that *come to you.*
- **Cards** (render only enabled ones):
  - **Home lessons** (`home`). Wale comes to your home, anywhere in Lagos. One-on-one{lessonLength ? `, ${lessonLength} per lesson` : ''}.
  - **Online lessons** (`online`). Live video lessons from wherever you are. Same teacher, same feedback.
  - **Learn together** (`group`). Siblings, friends or a church band learning side by side.
  - Each card's price line: `lessons.price` if set, else "Ask for a price on WhatsApp".
- **Note** (only if `advisesOnInstruments`): No saxophone yet? Ask Wale before you buy — a bad beginner instrument makes everything harder.
- **CTA (brass):** Book a trial lesson → Lessons Console

**Student testimonials** (`#students`; three placeholder cards)

- **Eyebrow:** Students
- **H2:** What students say after a few lessons.
- **Card 1:** “[Before: what they had tried — YouTube, teaching themselves. After: what they can play now.]”. [Student name] · [Adult beginner · Lekki]
- **Card 2:** “[A parent: how their child feels about practising and playing now.]”. [Parent name] · [Parent of a student · Ajah]
- **Card 3:** “[A church instrumentalist: what changed on Sunday.]”. [Student name] · [Church instrumentalist · Sangotedo]

### 6.9 Chapter III — Gallery (`#gallery`)

- **Chapter marker:** III · Watch
- **Eyebrow:** Watch
- **H2:** See him live *before you book.*
- **Link:** More on Instagram · [@handle] (a link only when `instagram.url` is set)
- **HUD hint** (3D mode): Drag to orbit · Tap to open. Fallback mode: no hint.
- **Counter:** 01 / 05 (unique items, zero-padded) + the current item's caption.

### 6.10 FAQ (`#faq`)

- **Eyebrow:** Questions
- **H2:** Before you message.
- Two groups, each with a small group label (caption style): **Performances**, **Lessons**.

**Performances**

1. **How much does it cost?** It depends on the date, how long you want him to play and where the event is. Send the details on WhatsApp and you’ll get a clear quote. *(+ " Packages start from {startingPrice}." if set)*
2. **How far will he travel?** Anywhere in Lagos — from Ajah and Lekki to the Island and the Mainland. Planning something outside Lagos? Send the location and ask.
3. **Can he play a specific song?** Yes. Send it ahead of time and he’ll prepare it — entrance songs, birthday favourites and first dances are exactly what he’s there for.
4. **Does he bring his own sound?** *(Only if `bringsSound` is set.)*
   - `own`: Yes — he brings his own speaker and mic, so all he needs is a power socket.
   - `venue`: He plugs into your venue’s or DJ’s sound system — just let him know who’s handling sound.
   - `either`: Either works. He can bring his own speaker and mic, or plug into your venue’s or DJ’s system.
5. **How early should I book?** As early as you can. He can only play one event at a time, and weekends go first.

**Lessons**

1. **I’ve never played. Is that okay?** Yes. Lessons start from the very beginning: holding the saxophone, breathing, and your first notes.
2. **Do I need my own saxophone?**
   - If `advisesOnInstruments`: You’ll need one to practise between lessons. If you don’t have one yet, ask Wale before you buy — he’ll tell you what to look for.
   - Otherwise: You’ll need one to practise between lessons.
3. **How old do you have to be?** *(Only if `youngLearners.enabled`.)*
   - If `minAge` is set: Lessons are for adults and young learners from age {minAge}.
   - Otherwise: Adults and young learners are both welcome — send the student’s age on WhatsApp and Wale will tell you if it’s a good time to start.
4. **How often are lessons, and how much?** Send your level, area and preferred days on WhatsApp, and Wale will suggest a schedule and price. *(+ " Lessons are {price}." if set)*
5. **Can I learn gospel, Afrobeats or jazz specifically?** Yes. Tell him the music you love in your first message — your lessons are built around the songs you want to play.

### 6.11 Final CTA (`#contact`)

- **Eyebrow:** Your move
- **H2:** Hear him live, or learn to play. *Either way, he comes to you.*
- **P:** One saxophonist, one event a night — and only so many lesson slots in a week. If your date or your start matters, send the message now.
- **CTA 1 (XL, brass):** Check Wale’s availability → Booking Console
- **CTA 2 (XL, outline):** Book a trial lesson → Lessons Console
- **Microcopy:** Prefer to call? **0704 014 9133** (`tel:+2347040149133`)

### 6.12 404 page (`src/app/not-found.tsx`)

- **Eyebrow:** Lost in space
- **H1:** This page drifted *off the map.*
- **Body:** The music is still playing on the home page.
- **Buttons:** Back to the home page (`/`), plus the WhatsApp widget.
- Same fonts and cosmos poster; no 3D.

---

## 7. Section specs (layout, interaction, motion)

Motion beats reference the tokens in §10.2. "Reveal" means a one-time entrance when the element is about 80% into the viewport (ScrollTrigger `once: true`), skipped entirely when motion is off.

### 7.1 Hero

- **Layout:** two columns ≥ 900px (copy 1fr min 460px, portrait max 500px); stacked on phones (copy first, then portrait at full width).
- **Above the fold, only:** eyebrow, H1, lead, two CTAs, microcopy, stats, portrait. Nothing else.
- **Intro (CSS only, no JS, must run before hydration):**
  - Light rails scaleY 0→1 from the top, staggered 18ms per rail.
  - Eyebrow fades in.
  - H1 words rise 0.35em with blur 8px→0 and opacity 0→1, staggered 70ms, 900ms `cubic-bezier(.2,.8,.2,1)`.
  - Lead, CTAs and stats follow at +180ms steps.
  - Total ≤ 1.4s.
  - Under `prefers-reduced-motion`, or with `html[data-motion="off"]` (§10.4): no intro at all; everything is visible at t=0.
- **Portrait (DOM `<picture>`, the LCP element):**
  - `fetchpriority="high"`, explicit width/height, never starts at opacity 0 or clipped. Its entrance may only be scale 1.03→1 plus brightness.
  - Soft edge mask (`mask-image` linear/radial gradients) so its black background dissolves into the void.
  - HUD corner ticks draw in (stroke-dashoffset) after load.
  - Pointer tilt on `pointer: fine`: rotateX/Y ≤ 6°, perspective 1200px, spring (§10.2 `ui`).
  - Holographic sheen: a brass→ivory linear gradient at 8–12% opacity with `mix-blend-mode: soft-light`, following the pointer.
  - A faint scanline overlay appears on hover only.
- **Gaze cue:** Wale looks screen-left, toward the copy and CTAs. Keep the portrait on the **right** at desktop widths.
- **Audio sample (optional, §8.6):** a small "Hear a phrase" text button under the microcopy, only if `site.audioSample` is set.

### 7.2 Paths

- **Layout:** two large cards side by side ≥ 760px; stacked on phones.
- **Card build:** each card is a `HudFrame` panel with a CSS-3D tilt (≤ 8°) and an inner parallax layer. It contains a small SVG "orbit" (a brass ellipse with a dot travelling around it, 12s per loop, paused when motion is off), the label, title, body and link.
- **Hover:** the edge glows brass, and the inner content lifts translateZ 20px.
- **Click:** smooth-scroll to the chapter (Lenis, with the sticky-nav offset) and fire a **warp burst** in the cosmos (§8.2) for 600ms.
- **Reveal:** the cards rise in with a 120ms stagger.

### 7.3 Chapter markers

- A full-width hairline with a centred caption-style label ("I · Performances"), flanked by two short brass ticks.
- **Reveal:** the line draws outward from the centre (scaleX), then the label fades.
- Each marker sets the cosmos **chapter tint** (§8.2) while its chapter is in view.

### 7.4 Why live sax

- **Layout:** heading left, paragraphs right (two columns ≥ 900px), features in a three-column grid underneath, each with a top hairline.
- **Reveals:** heading words via SplitText (mask, y 100%→0, stagger 40ms). This runs only after `document.fonts.ready`, and the text stays readable before JS runs. The italic brass word gets one shimmer pass: a background-clip gradient sweep, 1.2s.

### 7.5 Occasions

- **Layout:** 4-up grid ≥ 1100px, 2-up on tablets, 1-up on phones; images 4:5.
- **Hover (pointer: fine):**
  - image scale 1.035 over 700ms
  - a brass scanline sweeps once top→bottom
  - a pointer-following spotlight (radial gradient via CSS vars) lights the card
- **Reveal:** stagger 90ms.
- **Footer line + outline CTA:** as in §6.6.

### 7.6 Pull quote

- Centred, max-width 900px, with an oversized brass opening quote mark.
- **Reveal:** words fade in with a 25ms stagger.
- Placeholder styling applies (§6.1).

### 7.7 Booking steps

- **Layout:** three cards (`--ink-2`), with a brass connector line between them on desktop that draws on scroll (scrub). On phones they stack vertically with a vertical connector.
- **Numbers:** Bodoni italic 48px, brass.
- **No pinning.**
- **Genres row** sits below.

### 7.8 Testimonials (hosts and students)

- Three-column grid, stacked on phones. **No carousels.** All cards are visible.
- **Reveal:** cards float up with a slight depth (translateZ via perspective) at a 100ms stagger.

### 7.9 Coverage

- **Layout:** `wale-sax-detail.jpg` is **not** used here (it belongs to Lessons). Use the **constellation** (SVG) on the left and copy plus area chips on the right; stacked on phones.
- **Constellation:**
  - An abstract west→east layout: Mainland nodes (Ikeja, Magodo, Yaba, Surulere, Festac) on the left, Island nodes (Ikoyi, Victoria Island) in the centre, Lekki corridor nodes (Lekki, Ajah, Sangotedo, Ibeju-Lekki) on the right.
  - **Ajah** is the home node: a larger brass node with a slow pulsing ring and the label "Base".
  - Lines from Ajah to each node draw on scroll (stroke-dashoffset scrub).
  - Hovering a chip highlights its node, and hovering a node highlights its chip.
  - Each node is labelled in DOM text; the SVG is decorative (`aria-hidden`), and the chips are the accessible list.
  - Caption: "Stylised map — not to scale."
- **Cosmos tint:** neutral.

### 7.10 Lessons intro

- **Layout:** two columns: copy and CTA left, `wale-sax-detail.jpg` right in a HUD frame with the same edge-mask treatment as the hero. Stacked on phones.
- **Cosmos tint:** shifts to amber-brass (§8.2) while the Lessons chapter is in view.

### 7.11 Lessons PAS

- A single centred column, max-width 760px. P1 and P2 are muted; P3 is the ivory emphasis.
- **Reveal:** paragraphs one by one, with P3 getting a brass hairline that draws above it, "the turn".

### 7.12 Who it's for

- A 2×2 grid of cards (1-up on phones). Each has a small line icon:
  - beginner: a single note
  - young learner: a small star
  - church: an arch
  - advanced: a waveform
- **Hover:** tilt ≤ 4° plus a spotlight.

### 7.13 Learning path

- **Desktop:** two columns. The heading and intro are sticky on the left (`position: sticky; top: 96px`). On the right, the four stages sit on a vertical "flight path" line.
- A brass **signal** travels down the line, scrubbed to scroll. Each stage node "ignites" (scale 1→1.25, brass glow) as the signal passes.
- **Phones:** a single column; the line and signal are still scrubbed; no sticky.

### 7.14 Formats

- Enabled format cards plus the instrument note and the brass CTA. With only one card, it spans comfortably (max-width 560px), not stretched.

### 7.15 Gallery

- The 3D Orbit Gallery (§8.3), or the DOM fallback grid (§8.5).
- **Section height:** `clamp(560px, 82svh, 880px)` in 3D mode.
- **HUD overlay (DOM):** prev/next buttons (44px), the counter, the caption, the hint and the Instagram link.

### 7.16 FAQ

- Accessible accordion: a `<button aria-expanded>` controls a region with `aria-labelledby`. Height animates with Motion (spring `ui`). The plus icon rotates 45°.
- Multiple items may be open at once. The two groups have visible labels.

### 7.17 Final CTA

- Centred. A wine nebula bloom rises behind the H2 as the section enters (cosmos tint: wine bloom).
- Two magnetic XL buttons, the call line, then the footer.

### 7.18 Sticky nav

- Translucent (`--ink-0` at 66%, with blur on the high tier only), plus a soft fade shadow below instead of a border.
- **Scroll progress hairline:** brass, 1px.
- **Behaviour:** the nav hides on scroll-down after 400px and reappears on scroll-up (transform only). It is always visible while focus is inside it.

---

## 8. 3D systems

### 8.1 Quality tiers (`src/lib/quality-tier.ts`)

Detect once on the client after mount. Re-evaluate when the motion preference changes.

| Tier | When | Cosmos | Gallery | Post-processing | DPR cap |
|---|---|---|---|---|---|
| `off` | `prefers-reduced-motion: reduce`; Motion toggle off; no WebGL2; `navigator.connection.saveData`; WebGL context lost | CSS poster (§8.5) | DOM grid | — | — |
| `low` | `deviceMemory ≤ 2` or `hardwareConcurrency ≤ 2` | CSS poster | DOM grid | — | — |
| `medium` | touch primary (`pointer: coarse`), or width < 1024, or `deviceMemory ≤ 4` | 2,500 particles, no ribbon | 3D, simplified (no bend, light RGB split) | none | 1.5 |
| `high` | everything else | 6,000 particles + ribbon | 3D full | Bloom + Noise + Vignette | 1.75 |

Additional rules:

- Wrap each canvas in drei `<PerformanceMonitor>`. When it declines, step **down** one tier (high → medium → low). Never step up within a session.
- Add a debug override for QA, `?tier=off|low|medium|high`. It only takes effect when the query param is present; never persist it.
- Always guard property reads (`navigator.deviceMemory` is Chromium-only).

### 8.2 Brass Cosmos (global background)

**Mounting**

- `CosmosCanvas` is a client component, loaded with `next/dynamic(..., { ssr: false })` **from inside a client component**.
- It loads after `window` `load` + `requestIdleCallback` (fallback: `setTimeout` 1200ms), and only for the medium and high tiers.
- Canvas: `position: fixed; inset: 0; z-index: -1; pointer-events: none; aria-hidden="true"`, `dpr={[1, cap]}`, `gl={{ antialias: false, powerPreference: 'high-performance', alpha: true }}`.
- It fades in over 1.2s once the first frame renders. The CSS poster sits underneath at all times, so there is never a black flash.

**Brass dust**

- `THREE.Points` with a custom `ShaderMaterial`: soft round sprites (computed in the fragment shader from `gl_PointCoord`), additive blending, `depthWrite: false`, and size attenuation.
- Colours: about 75% brass, 15% ivory, 10% wine.
- Distribution: a tilted, slowly rotating spiral disc (one revolution per about 6 minutes; never oscillate near 0.2 Hz), plus a sparse outer field.
- Keep particle alpha ≤ 0.6, and keep density low behind the central text column so contrast holds.

**Uniforms**

| Uniform | Driven by |
|---|---|
| `uTime` | the clock |
| `uWarp` | 0–1, damped. Lenis scroll velocity (normalised, clamped) plus warp bursts from path clicks. Stretches particles into streaks along screen-space Y and brightens them slightly. |
| `uTint` | `vec3`, damped toward the chapter target (below) |
| `uPointer` | `vec2`, damped; desktop parallax, camera offset ≤ 0.15 units |
| `uAudio` | 0–1, only when the audio sample plays (§8.6) |

**Chapter tints**

| Section in view | Tint |
|---|---|
| Hero / Performances | wine-warm |
| Coverage | neutral |
| Lessons | amber-brass |
| Gallery | deep neutral |
| FAQ | dim |
| Final CTA | wine bloom |

Drive these with ScrollTrigger `onToggle` per chapter.

**Sound ribbon (high tier only)**

- A `TubeGeometry` along an animated `CatmullRomCurve3` (a gentle sound-wave path drifting right of the hero portrait, behind content).
- `MeshPhysicalMaterial` (metalness 1, roughness 0.28, clearcoat 0.6, colour `#D4A64A`).
- Lighting from drei `<Environment resolution={256}>` built only from `<Lightformer>`s. **No HDRI presets**: they download from a CDN, which violates M-16.
- The ribbon ripples with `uAudio`.

**Post-processing (high tier only)**

- `<EffectComposer>` with Bloom (mipmapBlur, luminanceThreshold about 0.6, intensity about 0.6), Noise (opacity 0.04) and Vignette.

**Lifecycle**

- Pause rendering (`frameloop="never"`) when the tab is hidden or the tier drops to `off`.
- Dispose geometries, materials and textures on unmount.
- On `webglcontextlost`: drop to tier `off` and unmount.

### 8.3 Orbit Gallery

**Scene**

- A ring of curved photo "screens" orbiting a small glowing brass **core** (an emissive icosahedron at low detail, with a slow rotation).
  - Every slot has the same 4:5 portrait shape: `PlaneGeometry(0.8, 1, 32, 1)` in world units, scaled to taste, bent onto a cylinder in the vertex shader.
  - Images of any aspect are cover-fitted into that shape by the shader (below).
- Two thin brass orbit lines (`LineLoop`) at slight tilts complete the scene.
- The camera sits outside the ring looking slightly down.
- With N unique items, render `max(N, 10)` slots by repeating items (slot `i` → item `i % N`).

**Textures**

- Load with drei `useTexture` from the 1200w WebP in the image manifest (§14).
- Set `texture.colorSpace = THREE.SRGBColorSpace` and `anisotropy = min(8, renderer max)`.
- Shader cover-fit: compute UV scale/offset from `uImageAspect` vs `uPlaneAspect` so images are never stretched (M-11).

**Shader uniforms per plane**

| Uniform | Effect |
|---|---|
| `uHover` | 0–1 spring: holographic scanlines, slight brightness lift, and a 0.08 forward lift |
| `uVelocity` | ring angular velocity: plane bend (high tier) and an RGB split ∝ abs(velocity), clamped (high: 0.012, medium: 0.004) |
| `uDim` | 0–1, while the lightbox is open |
| `uActive` | whether this slot is the focused item |

End the fragment shader with `#include <tonemapping_fragment>` and `#include <colorspace_fragment>`, and set `toneMapped={false}` if needed. A photo in the gallery must look identical in colour and brightness to the same photo as a DOM `<img>`; QA compares them side by side.

**Input**

| Input | Behaviour |
|---|---|
| **Drag** | Pointer Events with `setPointerCapture`. Track position history (last ~100ms) for velocity. Movement threshold 6px before a drag commits. Rotation follows the finger 1:1, respecting the grab point. |
| **Release** | Project momentum Apple-style: `projected = current + (v/1000) * 0.998 / (1 - 0.998)`, in angle units. Snap to the nearest slot with a spring (§10.2: `snap` if slow, `flick` if fast). The animation starts from the live value with the release velocity, and stays interruptible: grabbing mid-spin stops it immediately. |
| **Tap** (no drag, < 250ms) on a plane | Opens the Lightbox from that plane's projected screen rect (§9.5). |
| **Wheel** | Only when the pointer is over the gallery **and** the gesture is horizontal (`abs(deltaX) > abs(deltaY)`) or Shift is held. **Never** capture vertical wheel, which would trap page scroll. |
| **Keyboard** | A visually hidden but focusable list of buttons, one per unique item, synced with the ring. ←/→ rotate one item; Enter/Space opens the Lightbox. An `aria-live="polite"` region announces "Photo 3 of 5: {alt}". |
| **On-screen buttons** | Prev/next (44px, HUD style), plus the counter and caption. |

**Entrance**

- When the section enters, the slots fly in from deep z at a 60ms stagger, the orbit lines draw, and the core ignites.
- The canvas pauses (`frameloop="never"`) when the section is off-screen (IntersectionObserver) and resumes when it is visible.

### 8.4 Shaders

- Write GLSL as TypeScript template strings in `src/components/three/shaders/*.ts`, tagged with a `/* glsl */` comment.
- **Do not import `.glsl` files.** Turbopack has no raw loader configured.

### 8.5 Fallbacks (tiers `off` and `low`)

- **Cosmos poster:** CSS only. Layered radial gradients (a wine glow bottom-left at 40%, a faint brass haze top-right at 10%) on `--ink-0`, the light rails, and a sparse static starfield made with a few `radial-gradient` dots in a repeating 240px tile at ≤ 6% opacity.
- **Gallery:** the legacy layout. One large 16:9 tile plus a 2×2 grid of squares (any extra items continue in a 3-column grid). The same Lightbox opens from each tile. Full keyboard support.
- All content, CTAs and pop-ups remain. Only decoration changes.

### 8.6 Optional audio sample

When `site.audioSample` is set:

- The hero shows a text button, **Hear a phrase**, with a small waveform icon.
- On click (a user gesture), play the file through an `AudioContext` with an `AnalyserNode`. Average the low and mid bins into `uAudio` (damped), which makes the dust pulse and the ribbon ripple.
- The button becomes **Stop**. Playback ends automatically at the end of the clip.
- Never autoplay. When motion is off, the audio still plays but no visuals react.
- When `audioSample` is null, nothing renders and no audio code loads (dynamic import).

---

## 9. Pop-ups and overlays

### 9.1 Shared rules

- Use Radix Dialog for the consoles, the Lightbox and the Mobile Sheet. Use an anchored popover (an accessible disclosure: `aria-expanded`, Esc closes, click outside closes, focus moves into it and returns to the trigger) for the Contact Menu and the WhatsApp widget panel.
- **Materialise, don't fade:**
  - Surfaces enter from their trigger (`transform-origin` set to the trigger's position): scale 0.96→1, opacity 0→1, plus a backdrop blur of 0→16px on the high tier (a solid scrim of `--ink-0` at 70% otherwise).
  - They exit along the same path (spatial consistency).
  - Spring: `ui` (§10.2).
- While any modal is open:
  - call `lenis.stop()`, and `lenis.start()` on close
  - put `data-lenis-prevent` on scrollable modal content
  - leave the background inert (Radix handles aria-hidden and scroll lock)
- Focus goes to the first meaningful control on open and returns to the exact trigger on close. Esc always closes. The close buttons are 44px with `aria-label="Close"`.
- Respond on pointer-down: pressed state scale 0.97 within 1 frame.

### 9.2 Booking Console

- **Title:** Book Wale. **Subtitle:** Answer a few quick questions — your WhatsApp message writes itself.
- **Fields** (all optional; native inputs):
  1. **Occasion** (radio chips): Wedding · Birthday or surprise · Proposal or anniversary · Dinner or corporate event · Church or thanksgiving · Something else
  2. **Date:** `<input type="date">`, plus a checkbox **Date not fixed yet** that disables the date input. `min` is set to today **on the client after mount** (never during render, to avoid a hydration mismatch).
  3. **Location:** a text input with a `<datalist>` of `site.areas`. Placeholder "e.g. Lekki Phase 1".
  4. **Guests** (radio chips): Under 30 · 30–100 · 100–300 · 300+ · Not sure
  5. **Anything else?** (textarea, 3 rows): "Songs, timings, dress code…"
- **Live preview:** a HUD panel titled "Your message" that shows the exact text that will be sent (§9.6), updating as the user types. It is `aria-live="off"`, so it doesn't chatter.
- **Primary:** an `<a>` styled as an XL brass button, **Send on WhatsApp**, whose `href` updates live. Never `window.open` from a handler, which pop-up blockers can kill. A real link always works.
- **Secondary link:** "Just want to say hi?" → the general template.
- **Phones:** the console becomes a bottom sheet with drag-to-dismiss (§9.7 behaviour). Desktop: a centred panel, max-width 560px.

### 9.3 Lessons Console

- **Title:** Start lessons. **Subtitle:** Tell Wale where you’re starting — he’ll suggest a plan.
- **Fields:**
  1. **Who’s learning?** (radio chips): Me · My child · Someone else
  2. **Age** (number, optional). Show it only when "My child" or "Someone else" is selected.
  3. **Experience** (radio chips): Never played · A little · I already play
  4. **Format** (radio chips, built from the enabled flags): Home lessons · Online lessons · Learning together · Not sure. **Hide the whole question if only one format is enabled**, and send that format.
  5. **Area:** a text input with a datalist. Show it if Home lessons is selected, or if home is the only format.
  6. **Preferred days** (checkbox chips): Mon … Sun · Flexible
- Preview and Send exactly as in §9.2.

### 9.4 Contact Menu and WhatsApp widget

- **Widget button:**
  - Fixed bottom-right at `clamp(16px, 3vw, 28px)` from both edges, plus `env(safe-area-inset-bottom)`.
  - A 60px circle in `--wa`, with the white WhatsApp glyph (simple-icons) at 30px.
  - `aria-label="Chat with Wale on WhatsApp"`, `aria-expanded`.
  - The label chip "Chat with Wale" shows to its left at ≥ 640px.
  - Z-index above content and below modals.
- **Panel:**
  - Pops up from the button (origin bottom-right) on spring `ui`; the options stagger in at 40ms.
  - Header: "Wale · Saxophonist" + "Replies on WhatsApp".
  - Three options (§6.3), each a full-width 48px `<a>` row with an icon.
  - A close button.
- **No-JS behaviour:** the widget is an `<a>` straight to the general template.
- **Contact Menu (nav):** the same three options, in a popover anchored under the nav button.
- **Footer spacing:** the footer and page bottom have enough padding (≥ 104px) that the widget never covers text or links.

### 9.5 Lightbox

- **Opening:**
  - From the 3D gallery: compute the clicked plane's screen-space rect by projecting its four corners, then run a FLIP. The DOM image starts at that rect and springs to the centred fit (`object-fit: contain`, max 92vw × 80svh). The ring dims (`uDim`) and pushes back.
  - From the DOM grid: use a Motion `layoutId` shared-element transition.
  - Closing reverses into the same rect.
- **Content:** the image (the 1600w variant), the caption, the counter, prev/next buttons, and close.
- **Video items:**
  - With `videoSrc`: a `<video controls playsInline preload="none" poster>`. Never autoplay with sound.
  - With `externalUrl`: a **Watch on Instagram/YouTube** button that opens a new tab. No iframes.
- **Keyboard:** ←/→ navigate, Esc closes.
- **Touch:**
  - Swipe left/right to navigate (6px threshold, velocity projection).
  - Swipe **down** to dismiss. The image follows the finger 1:1 with rubber-banding upward. On release, it dismisses if the projected offset exceeds 30% of the viewport height or the velocity exceeds 800px/s; otherwise it springs back.

### 9.6 WhatsApp messages (exact) and link builder

Build everything in `src/lib/whatsapp.ts`:

```ts
export const waLink = (message: string) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;
```

The number is digits only, in international format, with no `+` and no leading `0`. Line breaks are `\n` (encoded as `%0A`).

**Booking** (default/no-JS version: all values blank):

```
Hi Wale, I found your website and I’d like to book you.
Occasion: {occasion}
Date: {date | "Not fixed yet"}
Location: {location}
Guests: {guests}
{notes — this line only if non-empty}
```

**Lessons** (default/no-JS version: all values blank):

```
Hi Wale, I found your website and I’d like saxophone lessons.
Who’s learning: {who}{age ? ` (age ${age})` : ''}
Experience: {experience}
Format: {format}
Area: {area}
Preferred days: {days joined with ", "}
```

**General:**

```
Hi Wale, I found your website and I have a question:
```

Rules:

- Empty fields keep their label with nothing after the colon and space, so the client can finish typing in WhatsApp.
- **Dates:** parse `yyyy-mm-dd` manually into `new Date(y, m - 1, d)`. Never use `new Date('yyyy-mm-dd')`, which is UTC and shifts the day in some timezones. Format with `Intl.DateTimeFormat('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`, e.g. "Saturday, 14 November 2026".
- Trim user input and collapse runs of 3+ newlines.
- Unit-test `whatsapp.ts` (Playwright can import it in a test, or add a tiny `node --test` file): exact strings for an empty form, a full form and an unfixed date.

### 9.7 Mobile Sheet (menu)

- On < 860px, the Menu button opens a bottom sheet with the four section links, "Message Wale", and the Motion toggle.
- Drag-to-dismiss: 1:1 tracking with rubber-banding above the open position. On release, use velocity projection: dismiss if the projected position is past 50% of the sheet's height, else spring back (spring `sheet`).
- Tapping a link closes the sheet, then scrolls to the section.

---

## 10. Motion system

### 10.1 Principles (Apple fluid-interface rules)

- **Respond on press:** pressed states apply on `pointerdown`, never on `click`.
- **Springs for anything touchable**, and every animation is interruptible: start from the live (presentation) value, never jump.
- **Velocity handoff** from gesture to spring. **Momentum projection** picks the snap target.
- **Spatial consistency:** things exit the way they came, and pop-ups grow from their trigger.
- **One hero moment per section.** Everything else is quiet.
- **Never lock input** during a transition.

### 10.2 Tokens (`src/lib/motion-tokens.ts`)

| Name | Spec | Use |
|---|---|---|
| `ui` | spring, bounce 0, duration 0.35 | Pop-ups, accordions, tilt return, magnetic return |
| `snap` | spring, bounce 0, duration 0.4 | Gallery snap after a slow release |
| `flick` | spring, bounce 0.2, duration 0.4 | Gallery snap after a fast flick; sheets after a throw |
| `sheet` | spring, bounce 0.2, duration 0.3 | Bottom sheets and drawers |
| `reveal` | 0.9s `cubic-bezier(.2,.8,.2,1)` | Scroll reveals (GSAP `expo.out` equivalent is fine) |
| `press` | 80ms ease-out, scale 0.97 | Pressed state |
| Stagger | 40ms (words) · 90–120ms (cards) | |

### 10.3 Scroll stack

- **Lenis:** `ReactLenis root` with `lerp: 0.1`, `smoothWheel: true`, `syncTouch: false` (native touch scrolling on phones), `anchors: { offset: -80 }`, and `autoRaf: false`.
- **Shared clock:** drive Lenis from GSAP's ticker. `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, and `lenis.on('scroll', ScrollTrigger.update)`.
- **GSAP in React:** use `useGSAP` from `@gsap/react` with a `scope` everywhere, so Strict Mode double-mounts clean up.
- Call `ScrollTrigger.refresh()` after `document.fonts.ready` and after the hero image loads.
- **SplitText:** use it only for below-the-fold headings, after fonts are ready, with `autoSplit: true` and `aria: 'auto'`. Revert on unmount.
- **Hash links:** links to `#section` (including deep links like `/#lessons` on first load) land with the sticky-nav offset.

### 10.4 Motion preference (`src/lib/motion-preference.ts`)

- One store (`useSyncExternalStore`) combines the OS `prefers-reduced-motion` with the user's **Motion** toggle, saved to `localStorage` key `wale-motion` (wrap every access in try/catch). Default = on, unless the OS asks to reduce motion.
- **No flash for returning "motion off" users:** a tiny inline `<script>` in `<head>` (in `layout.tsx`, via `dangerouslySetInnerHTML`, about 150 bytes, inside try/catch) reads `wale-motion` and sets `data-motion="off"` on `<html>` before first paint.
  - Gate the hero's CSS intro on `@media (prefers-reduced-motion: no-preference)` **and** `html:not([data-motion="off"])`.
  - Use JS-driven effects from the store.
- **When off:**
  - no Lenis (native scroll)
  - no cosmos canvas (poster only)
  - DOM gallery
  - no SplitText, tilt, magnetic effects, cursor follower or orbit SVG motion
  - pop-ups use a 150ms opacity cross-fade
  - all content visible immediately
- `prefers-reduced-transparency: reduce`: no `backdrop-filter`; surfaces are solid `--ink-2`.
- `prefers-contrast: more`: hairlines become `rgb(244 239 230 / .4)`, and muted text becomes ivory-2.

### 10.5 Desktop extras (`pointer: fine` and motion on)

- **Magnetic buttons:** primary CTAs translate up to 6px toward the pointer within a 1.2× radius, and return on spring `ui`.
- **Cursor follower:** a 28px brass ring (1px) trailing the pointer on a spring. It grows to 48px over interactive elements and shows "Drag" over the gallery. It is decorative (`aria-hidden`), and the **native cursor stays visible**.

---

## 11. Accessibility (beyond M-12/13)

- Skip link "Skip to content" as the first focusable element.
- Landmarks: `header` > `nav`, `main`, `footer`. Each section has `aria-labelledby` pointing at its heading.
- One `<h1>` (hero). H2 per section, H3 for card titles. No skipped levels.
- Focus ring: 2px brass outline with a 3px offset on every focusable element (`:focus-visible`).
- **Every canvas** is `aria-hidden="true"` and decorative. The DOM carries all the information.
- **Chips** are real `<input type="radio|checkbox">` inside `<fieldset>` with a `<legend>`, styled as chips. Keyboard-operable with visible focus.
- Images: meaningful `alt` text from `site.ts`. Purely decorative images get `alt=""`.
- Language: `<html lang="en-NG">`.
- **Contrast:** brass `#D4A64A` on `#0A090B` ≈ 8.8:1; faint `#968D82` on `#0A090B` ≈ 6:1. Keep any text over the cosmos on an effective background no lighter than `--ink-3`.

---

## 12. Performance budget and tactics

**Budgets** (measured on the exported site served by `serve`):

| Metric | Budget |
|---|---|
| Lighthouse mobile Performance | ≥ 80 (gate) / ≥ 90 (target) |
| Lighthouse mobile Accessibility | ≥ 95 |
| Lighthouse mobile Best Practices | ≥ 95 |
| Lighthouse mobile SEO | 100 |
| Lighthouse desktop Performance | ≥ 95 |
| LCP (mobile, Lighthouse) | ≤ 2.5s |
| CLS | ≤ 0.05 |
| TBT (mobile) | ≤ 250ms |
| First-load JS for `/`, excluding lazy 3D/audio chunks | ≤ 200 KB gzipped |
| Lazy 3D chunks, total | ≤ 380 KB gzipped |
| Hero image, AVIF/WebP at the displayed size | ≤ 120 KB |

**Tactics**

- Server Components by default; client components only where interaction needs them.
- 3D, post-processing and audio code sit behind dynamic imports, and load only for the tiers that use them, after load and idle (§8.2).
- `fetchpriority="high"` on the hero portrait; everything below the fold uses `loading="lazy"` and `decoding="async"`.
- `next/font` with `display: swap`, latin subset only, preloaded.
- Animate only `transform`, `opacity` and `filter` (sparingly). Use `will-change` only while animating.
- No layout shift: every image has width and height; canvases are absolutely positioned; fonts have fallback metrics (`next/font` does this automatically).
- Check chunk sizes from the `next build` output and log them in `HANDOFF-M3.md`.

---

## 13. SEO and metadata

- **`metadata` in `layout.tsx` / `page.tsx`:**
  - `metadataBase: new URL(site.siteUrl)`
  - **Title:** `Wale | Saxophonist for Hire & Saxophone Lessons in Lagos`
  - **Description:** `Book Wale, a live saxophonist based in Ajah, for weddings, birthdays and events anywhere in Lagos, or learn the sax with one-on-one lessons at home.` (148 characters)
  - `alternates.canonical: '/'`
  - Theme colour goes in a separate `export const viewport = { themeColor: '#0A090B' }`, **not** in `metadata` (deprecated there)
  - Open Graph: type website, the same title, the description, image `/_img/og.jpg` 1200×630, locale `en_NG`
  - `twitter.card: summary_large_image`
- **JSON-LD** in `page.tsx`: render with `JSON.stringify(data).replace(/</g, '\\u003c')`. Use an `@graph` containing:
  - **`Person`:** `@id: siteUrl + '/#wale'`, name, jobTitle Saxophonist, image, telephone `+2347040149133`, address (Ajah, Lagos, NG), `sameAs` = the Instagram URL if set
  - **Two `Service` entries** ("Live saxophone performance", "Saxophone lessons"), each with `provider` → the Person `@id` and `areaServed` City Lagos
  - **No `AggregateRating` or `Review`.**
- **`app/robots.ts`** (allow all, sitemap URL) and **`app/sitemap.ts`** (one URL, `/`), both with `export const dynamic = 'force-static'`. `prepare-deploy.mjs` fails the build if `out/robots.txt` or `out/sitemap.xml` is missing. If that happens, generate both into `public/` from `site.ts` in `scripts/optimize-images.mjs` instead, and log the decision.
- **`src/app/icon.svg`:** a brass italic "W" drawn as **paths** (not text) on a `#0A090B` rounded square.

---

## 14. Images and replaceable assets (`scripts/optimize-images.mjs`)

- **Input:** every `public/images/*.{jpg,jpeg,png,webp}`. This folder is the source of truth; Nonso and Wale replace files here by **same name**.
- **Output (gitignored, regenerated on every `dev` and `build`):** `public/_img/`
  - For each width in [480, 800, 1200, 1600] that is ≤ the source width (if the source is narrower than 480, use its own width): `<name>-<w>.avif` (quality 50, effort 4) and `<name>-<w>.webp` (quality 72).
  - `public/_img/og.jpg`: 1200×630 on `#0A090B`, with `wale-hero.jpg` fitted to the full height on the right third and a 1px brass hairline frame inset 24px (an SVG overlay, **no text**). JPEG quality 82.
  - `public/_img/manifest.json`: `{ "<file name>": { "width", "height", "avif": "<srcset>", "webp": "<srcset>", "src": "/images/<file name>" } }`.
- **Behaviour:**
  - Skip work when an output is newer than its source (fast dev).
  - Exit non-zero on a real error.
  - Do nothing gracefully if the folder is empty.
  - Log a one-line summary.
- **`src/lib/images.ts`** (server-only usage) reads the manifest with `fs` at build time inside a try/catch. If the manifest or an entry is missing, fall back to the original `/images/<name>` with the width and height read via `sharp` metadata, or with omitted dimensions plus a CSS `aspect-ratio`. Never import the manifest as a module: it does not exist before the first build.
- **`<Picture>`** renders `<picture>` with AVIF and WebP `<source>`s plus `sizes`, an `<img>` fallback, width and height, alt, loading and fetchpriority. Image data is passed from server components into client components as props.

---

## 15. Hostinger deployment

### 15.1 How it works

```
push to main ──► GitHub Actions: npm ci → lint → build → typecheck → prepare-deploy
             ──► commit out/ (incl. .htaccess) onto branch "deploy" (normal fast-forward commit)
             ──► Hostinger Git (GitHub App, branch "deploy") auto-pulls into public_html
```

The `deploy` branch keeps a linear history (normal commits, never force-pushed), so Hostinger's pull always fast-forwards.

### 15.2 `.github/workflows/deploy.yml` (verbatim)

```yaml
name: Build and publish to Hostinger

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: publish-hostinger
  cancel-in-progress: true

jobs:
  build-and-publish:
    runs-on: ubuntu-latest
    timeout-minutes: 20
    steps:
      - name: Check out main
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Build static site
        run: npm run build

      - name: Type-check
        run: npm run typecheck

      - name: Add Hostinger files and verify the export
        run: node scripts/prepare-deploy.mjs

      - name: Publish out/ to the deploy branch
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          set -euo pipefail
          REPO_URL="https://x-access-token:${GH_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
          SITE_DIR="${RUNNER_TEMP}/site"
          if git ls-remote --exit-code --heads "$REPO_URL" deploy > /dev/null 2>&1; then
            git clone --quiet --depth 1 --branch deploy "$REPO_URL" "$SITE_DIR"
          else
            mkdir -p "$SITE_DIR"
            git -C "$SITE_DIR" init --quiet --initial-branch=deploy
          fi
          find "$SITE_DIR" -mindepth 1 -maxdepth 1 ! -name .git -exec rm -rf {} +
          cp -a out/. "$SITE_DIR"/
          cd "$SITE_DIR"
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add -A
          if git diff --cached --quiet; then
            echo "Nothing changed since the last deploy."
            exit 0
          fi
          git commit --quiet -m "Deploy ${GITHUB_SHA}"
          git push --quiet "$REPO_URL" HEAD:deploy
```

The publish step was dry-run against a local bare repository. It handles the first run (creates the branch), carries dotfiles such as `.htaccess`, skips unchanged builds, and produces fast-forward history that a server-side `git pull --ff-only` accepts.

### 15.3 `.htaccess` files (verbatim)

`deploy/htaccess-root`, copied to `out/.htaccess`:

```apache
# Hostinger (LiteSpeed/Apache) settings for Wale's static Next.js export.
# Copied into out/ by scripts/prepare-deploy.mjs. Do not edit files in public_html directly.
# HTTPS: turn on "Force HTTPS" in hPanel → Security → SSL (no redirect rules here, to avoid loops).

Options -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html

AddType image/avif .avif
AddType image/webp .webp
AddType font/woff2 .woff2

<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()"
  Header always set X-Frame-Options "SAMEORIGIN"

  <FilesMatch "\.html$">
    Header set Cache-Control "no-cache"
  </FilesMatch>
  <FilesMatch "\.(avif|webp|jpe?g|png|svg|ico|mp4|webm|mp3|json|txt|xml)$">
    Header set Cache-Control "public, max-age=86400"
  </FilesMatch>
</IfModule>

<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/css text/xml application/javascript application/json application/xml image/svg+xml
</IfModule>
```

`deploy/htaccess-static`, copied to `out/_next/static/.htaccess`:

```apache
# Next.js build assets are content-hashed: safe to cache for a year.
<IfModule mod_headers.c>
  Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>
```

Images are cached for only one day on purpose: they are replaced by **same name**, so a long cache would show stale photos.

### 15.4 `scripts/prepare-deploy.mjs` (verbatim; tested)

```js
// Runs after `npm run build`. Adds the Hostinger .htaccess files to out/
// and fails loudly if the export is incomplete. Used by CI and by QA.
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const OUT = 'out';
const WHATSAPP = 'wa.me/2347040149133';
const fail = (msg) => { console.error(`prepare-deploy: ${msg}`); process.exit(1); };

if (!existsSync(OUT)) fail('out/ not found. Run `npm run build` first.');

copyFileSync(join('deploy', 'htaccess-root'), join(OUT, '.htaccess'));
mkdirSync(join(OUT, '_next', 'static'), { recursive: true });
copyFileSync(join('deploy', 'htaccess-static'), join(OUT, '_next', 'static', '.htaccess'));

const required = [
  'index.html', '404.html', '.htaccess', '_next/static/.htaccess',
  'robots.txt', 'sitemap.xml', '_img/og.jpg', 'images/wale-hero.jpg',
];
const missing = required.filter((f) => !existsSync(join(OUT, f)));
if (missing.length) fail(`missing from out/: ${missing.join(', ')}`);

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const p = join(dir, name);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const forbidden = ['/_blob/', 'localhost:', '127.0.0.1'];
for (const file of walk(OUT).filter((p) => p.endsWith('.html'))) {
  const html = readFileSync(file, 'utf8');
  const hit = forbidden.find((s) => html.includes(s));
  if (hit) fail(`${file} contains "${hit}"`);
}

const index = readFileSync(join(OUT, 'index.html'), 'utf8');
if (!index.includes(WHATSAPP)) fail(`index.html has no ${WHATSAPP} link`);

const placeholders = index.match(/\[[^\]<>]{1,80}\]/g) ?? [];
console.log(`prepare-deploy: out/ is ready for Hostinger (${placeholders.length} [placeholder] strings still on the page).`);
```

### 15.5 One-time Hostinger setup (put this in the README for Nonso)

1. Push to `main`. On GitHub, open **Actions** and wait for "Build and publish to Hostinger" to finish green. This creates the `deploy` branch.
2. In hPanel, open the website's **File Manager** → `public_html`. Download a backup of anything there, then **delete everything inside it**: Hostinger's first Git deployment needs an empty folder.
3. In hPanel, go to **Advanced → Git → Connect with GitHub**:
   - Install the Hostinger GitHub App with access to this repository, then select the repository.
   - **Branch: `deploy`.** Not `main`.
   - **Deploy directory:** the default (`public_html`).
   - Click **Deploy** and watch the log.
4. In hPanel, go to **Security → SSL** and make sure SSL is active with **Force HTTPS** on.
5. Open `site.ts`, set `siteUrl` to the real domain, and commit. The site redeploys itself.

From then on, every push to `main` (including edits made in the GitHub website) goes live in a few minutes. If a change doesn't appear, check the Actions run, then press **Redeploy** under hPanel → Advanced → Git.

**Never edit files inside `public_html` by hand.** The next pull can fail on modified files.

**Older hPanel without "Connect with GitHub":** use the SSH method on the same Git page.

- Repository URL: the HTTPS URL for a public repo, or the SSH URL plus the generated key added under GitHub → Settings → Deploy keys for a private repo.
- Branch: `deploy`.
- Directory: blank.
- Then open **Auto Deployment**, copy the webhook URL, and add it in GitHub → Settings → Webhooks for push events.

### 15.6 README (written in M4)

The README is for Nonso and Wale, in plain language. It must cover:

- what the site is
- how to edit text and prices (`src/content/site.ts` via the GitHub web editor)
- how to replace photos (upload to `public/images/` with the same name)
- how to add gallery items
- how to add the audio sample or a video
- the Hostinger one-time setup (§15.5)
- how to preview locally (optional): `npm install`, `npm run dev`, or `npm run build && npm run preview`
- troubleshooting: Actions failed, a change didn't appear, a 404 shows on refresh
- **"Before launch: confirm with Wale"**: every CONFIRM flag and `[BRACKET]` placeholder, as a checklist

---

## 16. QA plan

### 16.1 Commands (clean, CI-equivalent)

```bash
node -e "for (const d of ['node_modules','.next','out']) require('fs').rmSync(d,{recursive:true,force:true})"
npm ci && npm run lint && npm run build && npm run typecheck && node scripts/prepare-deploy.mjs
npx serve out -l 4173   # in the background; all tests hit http://localhost:4173
npx playwright test
```

`playwright.config.ts`:

- `webServer: { command: 'npx serve out -l 4173', url: 'http://localhost:4173', reuseExistingServer: true }`
- Projects: `desktop-chromium` (1440×900), `mobile-chromium` (Pixel 7 device profile), and `webkit-iphone` (iPhone 14) **if WebKit is installed**. Skip that project with a note in the report otherwise.
- `trace: 'retain-on-failure'`.

### 16.2 Required tests (one spec file per group)

**Smoke and export**

1. `/` returns 200, has the title from §13, and exactly one `h1` containing "Live saxophone".
2. No console errors. The only allowed warnings are GPU/WebGL performance notices from headless Chromium. List any you allow.
3. No failed requests (4xx/5xx) while scrolling the full page at both viewports.
4. `out/` contains everything `prepare-deploy.mjs` requires; `out/404.html` renders the branded 404 when served (`/does-not-exist`).

**Content parity**

5. Every heading, paragraph, card, step, FAQ item and CTA label in §6 is present, with exact text (driven by importing `site.ts`).
6. Flag behaviour: keep the flag logic in pure helper functions in `src/content/derive.ts` (e.g. `lessonFormats(site)`, `faqItems(site)`, `lessonsConsoleQuestions(site)`). Unit-test them with every combination of `lessons.online`, `group`, `home` and `youngLearners.enabled`/`minAge`, plus `performance.bringsSound` and `startingPrice`, and assert that the right cards, FAQ items and console questions appear or disappear. No rebuild is needed.

**Typography parity**

7. Serve `legacy/` too (`npx serve legacy -l 4174`). At 390px and 1440px, compare computed `font-family` (the regex `/Bodoni|Instrument/`; `next/font` renames families with a hash prefix), `font-size`, `font-weight`, `font-style`, `line-height` and `letter-spacing` for: the H1, the "Why live sax" H2, the eyebrow, the lead, a body paragraph, a card title, a button, a chip and the wordmark.
   - Tolerance ±0.5px, or ±0.005em of letter-spacing.
   - Assert that `document.fonts.check()` passes for both families after load.

**WhatsApp**

8. Every `a[href*="wa.me"]` uses number `2347040149133` and has `target="_blank"` and `rel` containing `noopener`. Decoding `text` starts with one of the three template first lines (§9.6).
9. **Booking Console:**
   - Opens from the hero primary CTA, with focus inside.
   - Fill occasion "Wedding", date 2026-11-14, location "Lekki Phase 1", guests "100–300" and notes "Entrance at 4pm". The Send link decodes to the exact expected string (dated "Saturday, 14 November 2026").
   - With "Date not fixed yet", the date line reads "Not fixed yet".
   - Esc closes it and focus returns to the CTA.
10. **Lessons Console:** the exact expected message for a full and an empty form. Age appears only for child/someone else. The format question is hidden when only one format is enabled.
11. **Widget:** visible bottom-right at 320, 390 and 1440px. Opens with three correct links; Esc closes. The widget never overlaps the footer's text when scrolled to the bottom (bounding-box check).
12. **No-JS:** a test with `javaScriptEnabled: false` asserts that the hero CTAs, the nav button and the widget are `wa.me` links with the default templates.

**Interaction and motion**

13. **Nothing stuck invisible:** with motion on, scroll through the entire page slowly at both viewports. After each section enters, every `h1`/`h2`/`h3`/`p`/`li`/`a`/`button` inside it has computed opacity ≥ 0.99 and a non-zero box. **This catches broken GSAP reveals.**
14. **Reduced motion** (`page.emulateMedia({ reducedMotion: 'reduce' })`):
    - no `canvas` in the DOM
    - `html` has no `lenis` class
    - the DOM gallery is present
    - all content is visible at t=0 (no scroll needed for opacity)
    - pop-ups still work
15. **Motion toggle:** switching it off removes the canvases and persists across a reload; switching it on restores them.
16. **Anchors:** nav links and `/#lessons` deep links land with the section heading visible below the sticky nav.
17. **Mobile Sheet:** opens, its links navigate and it closes. A drag-down gesture (simulated pointer moves) dismisses it.
18. **FAQ:** `aria-expanded` toggles, the content is reachable, and keyboard Enter/Space works.

**3D**

19. `?tier=high`: a cosmos canvas and a gallery canvas exist.
    - Keyboard → on the gallery list updates the counter "02 / 05" and the live region.
    - Enter opens the Lightbox with the right image and alt; Esc closes it and returns focus.
    - A pointer drag rotates (the counter changes); a vertical wheel over the gallery still scrolls the page.
20. `?tier=low`, and a separate project launched with `--disable-webgl --disable-3d-apis`: no canvases, the DOM gallery works, the Lightbox works.
21. **Context loss:** run `WEBGL_lose_context.loseContext()` via `page.evaluate` on the cosmos canvas. The site drops to the poster with no console errors and no broken layout.
22. **Colour fidelity:** screenshot the gallery item in the Lightbox (DOM) next to the same item on the 3D plane (centred, hover off). The average luminance differs by < 6%.

**Layout and accessibility**

23. No horizontal overflow (`scrollWidth <= innerWidth`) at 320, 360, 390, 768, 1024, 1280, 1440, 1920 and 2560px.
24. axe (`@axe-core/playwright`): zero serious or critical violations on the page, and with each pop-up open (Booking, Lessons, Contact Menu, Widget, Lightbox, Mobile Sheet).
25. Keyboard-only run: Tab through the whole page. Every interactive element is reachable, has a visible focus ring and is never hidden behind the sticky nav.

**SEO**

26. Meta description length is 120–160 characters. The canonical, `og:image` (an absolute URL) and `twitter:card` are present. JSON-LD parses and contains one `Person` and two `Service` entries, with **no** `AggregateRating`. `out/robots.txt` and `out/sitemap.xml` reference `siteUrl`.

**Placeholders**

27. List every `[…]` string on the page. It must exactly match the README's "Before launch" list. A count mismatch is a Major issue.

**Unit**

28. `whatsapp.ts` exact-string tests (§9.6) and the date-parsing timezone test (run with `TZ=America/Los_Angeles`; the formatted day must not shift).

**CI readiness**

29. `package-lock.json` contains the four Linux native packages listed in §17 pitfall 28. `.github/workflows/deploy.yml`, `deploy/htaccess-root`, `deploy/htaccess-static` and `scripts/prepare-deploy.mjs` match §15 exactly (diff against this document). `.nvmrc` is `22`.

### 16.3 Lighthouse (Gate 4)

`lighthouserc.json`:

- Collect from `http://localhost:4173/` with 3 runs, in both mobile (default) and desktop (`preset: 'desktop'`).
- Point `chromePath` at Playwright's Chromium (get it from `require('@playwright/test').chromium.executablePath()` and pass it via an environment variable).
- Assert the §12 thresholds. Save the reports to `qa/lighthouse/`.

### 16.4 Visual review matrix (screenshots to `qa/screenshots/`)

| | 360×800 | 390×844 | 768×1024 | 1440×900 | 1920×1080 |
|---|---|---|---|---|---|
| Full page, motion off | ✔ | ✔ | ✔ | ✔ | ✔ |
| Hero viewport, motion on (after 2s) | | ✔ | | ✔ | |
| Gallery viewport, `?tier=high` | | ✔ | | ✔ | ✔ |
| Each pop-up open | | ✔ | | ✔ | |

The QA Tester **looks** at every screenshot and checks:

- typography matches §5.4 (no fallback fonts, no lone-word headlines on phones)
- spacing rhythm
- contrast over the cosmos
- placeholders styled as specified
- nothing overlapping the widget
- portrait edge mask clean
- HUD ticks aligned
- no AI tropes (§5.2)

Record findings with the screenshot paths.

### 16.5 Report format (`docs/QA-REPORT.md`)

1. Summary: gate, date, commit SHA, **GATE PASSED/FAILED**.
2. A table of M-01 … M-20: PASS/FAIL plus evidence (test name or screenshot).
3. A table of tests 1–29: PASS/FAIL/SKIPPED (with the reason).
4. Lighthouse scores (Gate 4).
5. Issues: ID, severity, title, repro steps, expected, actual, screenshot.
6. A history table of previous gates.

---

## 17. Known pitfalls (read before every milestone)

**Next.js and static export**

1. `next/dynamic(..., { ssr: false })` is only allowed inside a **Client Component** file. Calling it in a Server Component breaks the build.
2. `output: 'export'` forbids Server Actions, middleware, `headers()`/`cookies()`, ISR, `next.config` rewrites/redirects/headers, and `next/image` optimization (§4.3).
3. Accessing `window`, `document`, `localStorage`, `matchMedia` or `navigator` during render causes hydration errors. Do it in effects or `useSyncExternalStore` with a server snapshot.

**Fonts and styling**

4. The `next/font` variable names must not equal the Tailwind theme names (§5.4), or the theme references itself.
5. Tailwind v4 is configured in CSS (`@theme`). Do not create `tailwind.config.js` or use v3 syntax.
6. ESLint's `react/no-unescaped-entities` fails on `'` and `"` in JSX text. Keep the copy in `site.ts` and use ’ “ ”.

**3D and shaders**

7. Textures look washed out unless `texture.colorSpace = THREE.SRGBColorSpace`. Custom shaders must include the tonemapping and colorspace chunks (§8.3).
8. Cover-fit UVs in the gallery shader, or replaced photos stretch (M-11).
9. drei `<Environment preset=…>` downloads HDRIs from a CDN. Use `<Lightformer>`s only (M-16).
10. No `.glsl` imports under Turbopack; use template strings.

**Scroll, GSAP and Lenis**

11. Lenis plus GSAP: `autoRaf: false` and drive from `gsap.ticker`, `lagSmoothing(0)`, `lenis.on('scroll', ScrollTrigger.update)`. Refresh ScrollTrigger after fonts and the hero image load.
12. React Strict Mode mounts effects twice in dev. Use `useGSAP` scopes and clean up every listener, observer, ticker and WebGL resource.
13. Reveal animations that start from `opacity: 0` must not apply that style until JS confirms motion is on. Otherwise no-JS and reduced-motion users see blank sections. Set the initial hidden state from JS (`gsap.set` inside `useGSAP`), never in static CSS. Hero exception: its CSS intro is wrapped in `@media (prefers-reduced-motion: no-preference)`.
14. `position: sticky` dies inside any ancestor with `overflow: hidden`; use `overflow-x: clip`.
15. Never capture vertical wheel events in the gallery; let the page scroll.

**Pop-ups**

16. Radix Dialog scroll lock plus Lenis: stop Lenis while open, and add `data-lenis-prevent` to scroll areas inside modals.
17. `window.open` inside async code is pop-up-blocked. WhatsApp sends are real `<a href>` links.

**Dates and links**

18. `new Date('2026-11-14')` is UTC midnight and shifts the day west of UTC. Parse manually (§9.6).
19. `wa.me` takes digits only: no `+`, no spaces, no leading zero. Encode with `encodeURIComponent`.

**iOS Safari**

20. `100vh` jumps; use `svh`/`dvh`. `backdrop-filter` needs the `-webkit-` prefix (check the compiled CSS). Videos need `playsInline`.

**Images and the build**

21. A generated manifest that doesn't exist yet must never be `import`ed. Read it with `fs` in a try/catch at build (§14).
22. Pin nothing to TypeScript 7 or ESLint 10 (§4.2). No `--legacy-peer-deps`.
23. `out/`, `public/_img/` and `.next/` are never committed to `main`. The `deploy` branch is written only by CI.

**Hostinger**

24. Its first Git deploy needs an empty `public_html`, and later pulls fail if files there were edited by hand.
25. No HTTPS redirect rules in `.htaccess` (redirect loops behind Hostinger's proxy/CDN). Use hPanel's Force HTTPS.

**Windows**

26. Nonso is on Windows. No bash in npm scripts, no case-sensitivity assumptions (import paths must match file name case exactly; Linux CI is case-sensitive, Windows isn't).

**Placeholders and claims**

27. Never fill a `[BRACKET]` with plausible-sounding invented content (M-09). A placeholder that looks real is worse than one that looks like a placeholder.

**Cross-platform lockfile**

28. A `package-lock.json` created on Windows or macOS can miss the Linux native binaries that CI needs, and the build then dies on GitHub with "Cannot find native binding" or a sharp load error. After the final install, confirm the lockfile has entries for:
    - `node_modules/@img/sharp-linux-x64`
    - `node_modules/@tailwindcss/oxide-linux-x64-gnu`
    - `node_modules/lightningcss-linux-x64-gnu`
    - `node_modules/@next/swc-linux-x64-gnu`

    If any is missing, delete `package-lock.json` and `node_modules` and run `npm install` again. If one is still missing, add it to `optionalDependencies` pinned to the exact version its parent requires (`npm view <parent>@<version> optionalDependencies`). npm skips it on Windows but records it for Linux. Log this in `docs/DECISIONS.md`.

---

## 18. Definition of done

- [ ] All M-01 … M-20 PASS in the final `docs/QA-REPORT.md` (Gate 4), with 0 Blockers and 0 Majors.
- [ ] Tests 1–29 PASS (or SKIPPED with a reason the Orchestrator accepted).
- [ ] Lighthouse thresholds met (§12).
- [ ] `docs/PLAN.md`, `docs/DECISIONS.md`, `docs/HANDOFF-M1..M4.md` and `docs/QA-REPORT.md` are complete.
- [ ] README written for non-developers, including the "Before launch: confirm with Wale" checklist and the Hostinger steps.
- [ ] `.claude/agents/*.md` saved.
- [ ] Clean commits on `rebuild`, merged into `main` after Gate 4. The workflow file is present. **Nothing pushed to `deploy` by hand.**
- [ ] The final report has been delivered (§19).

## 19. Final report to Nonso

Keep it short, plain and scannable:

1. **What was built:** 3–5 lines. Name the hero moment, the gallery, the two chapters and the pop-ups.
2. **How to go live:** the §15.5 steps, numbered.
3. **What Wale needs to send:** every placeholder and CONFIRM flag, grouped as Numbers, Lessons details, Testimonials, Photos/video, Links, Domain.
4. **Results:** the Lighthouse scores and the QA gate summary (one line per gate).
5. **Known limitations:** anything SKIPPED, and why.
6. **One suggested next step.**
