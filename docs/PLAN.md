# Wale "Brass Cosmos" rebuild: PLAN

Planner output for Phase 1. Source of truth for requirements: `docs/BUILD-PROMPT.md` (cited as §n). Decisions: `docs/DECISIONS.md` (D-nnn). Tests in §16.2 are cited as **Q1–Q29**; Lighthouse §16.3 is **LH**; the visual matrix §16.4 is **VIS**; the CI command chain §16.1 is **CI**; the bundle budget check defined in §8 of this plan is **BUD**.

---

## Open questions (contradictions or impossibilities in BUILD-PROMPT.md)

Each has a proposed resolution. The Designer and QA follow the proposed resolution unless the Orchestrator overrides it.

| # | Issue | Evidence | Proposed resolution |
|---|---|---|---|
| OQ-1 | **The 200 KB "first-load JS" budget (§12) cannot hold if every non-3D library loads up front.** | Measured with the exact stack in a scratch static export (see §3, §8): Next 16.4.2 + React 19.3.1 with **zero** client components ships **170.8 KB gz**. Deltas on top: `gsap` +26.8, `gsap/ScrollTrigger` +17.2, `gsap/SplitText` +3.3, `@gsap/react` (pulls core) +26.9, `lenis/react` +6.1, `motion/react` (`motion`+`AnimatePresence`+layout) +44.5, `LazyMotion`+`domAnimation` +40.0, `@radix-ui/react-dialog` +12.9, `simple-icons` (2 icons) +1.9, `motion/mini`+`spring` +4.7. Everything eager = ~306 KB before app code. | Define **first-load JS = gzipped size of every `<script src>` chunk referenced by `out/index.html`** (what loads before hydration). Budget stays ≤ 200 KB for that. GSAP/Lenis/SplitText (MotionLayer chunk), Radix + Motion (OverlayHost chunk) and desktop effects (FxLayer chunk) become **deferred enhancement chunks**, loaded after hydration on idle, with their own budget **≤ 150 KB gz total** (measured: 135.3 KB for the libraries). 3D and audio stay ≤ 380 KB. Content and every CTA work before any deferred chunk arrives (they are plain links, M-07). Measured by `scripts/bundle-report.mjs` and QA check **BUD**. |
| OQ-2 | **Typography parity test Q7 conflicts with §5.4 on line-heights.** Legacy sets no line-height on card titles (occasion `h3`, 26px), feature/step `h3` (19px) or FAQ `summary` (18px); they inherit `line-height: 1.5`. §5.4 specifies 1.15 / 1.3 / 1.4. | `legacy/index.html`: `<h3 style="…font-size: 26px; letter-spacing: -0.01em">` inside a `line-height: 1.5` wrapper → computed 39px; §5.4 → 29.9px. | §5.4 is authoritative (M-01 says "follow §5.4"). Q7 compares every property against legacy **except** `line-height` of the card title, which is asserted against §5.4 (`26 × 1.15 = 29.9px ± 0.5`). QA records this as an accepted, documented deviation, not a failure. All other Q7 elements (H1, Why H2, eyebrow, lead, body, button, chip, wordmark) match legacy exactly. |
| OQ-3 | **§12 says "check chunk sizes from the `next build` output".** Next 16.4.2 no longer prints per-route sizes (verified: the route table shows only `○ /`, `○ /robots.txt` …). | Scratch build output. | Add `scripts/bundle-report.mjs` (Node, cross-platform): parses `out/index.html` for initial scripts, gzips every chunk in `out/_next/static/chunks/`, prints initial / deferred / 3D totals, exits non-zero over budget when run with `--check`. Not wired into `prebuild`/CI (CI stays verbatim). Designer pastes its output into `HANDOFF-M3.md` and `HANDOFF-M4.md`; QA runs it at Gates 3–4. |
| OQ-4 | **§16.3 points Lighthouse `chromePath` at Playwright's Chromium**, which cannot install on this macOS 12 machine. | D-002. | `lighthouserc.json` reads `chromePath` from env `LHCI_CHROME_PATH`; QA sets it to `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`. Already decided in D-002; listed for completeness. |
| OQ-5 | **§9.5 asks for a Motion `layoutId` shared-element transition from the DOM grid.** `layoutId` needs the grid tiles to be `motion.*` components, which forces `motion/react` (+44 KB) into the first-load bundle (OQ-1). | Bundle measurements above. | Use one FLIP code path for both sources: the Lightbox (deferred chunk, has Motion) receives the origin rect (`getBoundingClientRect()` of the DOM tile, or the projected plane rect from 3D), animates from it with spring `ui`, and closes back into the same rect (re-measured on close). Visually identical to `layoutId`, keeps spatial consistency, zero first-load cost. |
| OQ-6 | **Q13 ("every h1/h2/h3/p/li/a/button inside a section has opacity ≥ 0.99 and a non-zero box") would fail on content that is correctly hidden**: closed FAQ answers, the visually hidden gallery keyboard list (1×1 px clip), closed dialogs. | §7.16, §8.3. | Q13 excludes elements inside `[hidden]`, `[inert]`, `[aria-hidden="true"]`, `.sr-only`, closed accordion regions (`[data-state="closed"]`) and unopened dialogs. Q5 still asserts that closed FAQ answers are present in the DOM text. |
| OQ-7 | **§9.6 says "build everything in `src/lib/whatsapp.ts`"; M-10 says all copy lives in `site.ts`.** The message templates are copy. | §9.6 vs M-10. | Template strings (first lines and field labels) live in `site.messages`; `whatsapp.ts` contains only logic (`waLink`, `bookingMessage`, `lessonsMessage`, `generalMessage`, `formatDate`, `parseISODate`, `cleanText`). |
| OQ-8 | **Image widths that may not exist.** §8.3 says gallery textures use "the 1200w WebP"; §9.5 says the Lightbox uses "the 1600w variant". §14 only emits widths ≤ source width: `gal-1..4.jpg` are 900 px → only 480 and 800; `gal-video.jpg` 1600 → all four. | §3 image table, §14. | `images.ts` exports `pickVariant(entry, target, 'webp'|'avif')` = the largest emitted width ≤ target, else the smallest emitted width, else the original `/images/<name>`. Gallery textures use `pickVariant(…, 1200, 'webp')`, Lightbox uses `pickVariant(…, 1600, …)`. |
| OQ-9 | **Lessons flags with no defined copy.** §6.8 defines the intro lead for `home` and/or `online` only. With `home: false, online: false` (group-only or nothing enabled) there is no launch-safe text, and writing one would be new copy (M-08). | §6.8, §6.1. | `derive.ts` throws at build time with a plain-English error ("site.ts: enable lessons.home or lessons.online") if both are false. A broken flag combination fails CI loudly instead of shipping invented copy. Q6 asserts the throw. |
| OQ-10 | **Booking default template date line.** §9.6 says the default/no-JS version has "all values blank" but the template line is `Date: {date \| "Not fixed yet"}`. | §9.6. | Default/no-JS: `Date: ` (blank). In the console: blank when no date and the checkbox is unticked; formatted date when set; `Not fixed yet` only when "Date not fixed yet" is ticked. Q9 and Q28 assert all three. |
| OQ-11 | **`prepare-deploy.mjs` placeholder count is not a reliable list.** Its regex caps at 80 characters (the pull-quote and testimonial placeholders are longer, e.g. the pull quote is ~107 characters) and it scans raw HTML, which also contains the RSC flight payload (duplicates). | §15.4 regex `\[[^\]<>]{1,80}\]`. | Keep the script verbatim (Q29 diffs it). Its count is informational only. Q27 extracts placeholders from the rendered DOM text (`document.body.innerText`, regex `/\[[^\]]+\]/g`, de-duplicated with counts) and compares with the README list. |
| OQ-12 | **Widget/CTA element type after hydration.** §9.4 wants `aria-expanded` on the widget "button", and its no-JS form is an `<a>`. Swapping `<a>` for `<button>` on hydration causes a hydration mismatch. | §9.4, M-07, Q12. | Every CTA, the nav "Message Wale", and the widget stay `<a href="https://wa.me/…">` forever. JS adds `aria-haspopup="dialog"` and `aria-expanded`/`aria-controls` attributes (valid on `link` role) and intercepts plain left-clicks only (no modifier keys, `button === 0`). Middle-click or Cmd/Ctrl-click still opens WhatsApp. |
| OQ-13 | **Video `externalUrl` button label.** §9.5 says "Watch on Instagram/YouTube" without saying which. | §9.5. | `derive.ts` `videoAction(item)`: host `instagram.com` → `site.lightbox.watchOnInstagram`, `youtube.com`/`youtu.be` → `site.lightbox.watchOnYouTube`; any other host throws at build ("externalUrl must be Instagram or YouTube"). |
| OQ-14 | **Q28 runs with `TZ=America/Los_Angeles`**, which is shell syntax that does not work on Windows. | M-19 cross-platform rule. | The unit specs run in a browserless Playwright project `unit`; the date spec sets `process.env.TZ = 'America/Los_Angeles'` at the top of the file (Node re-reads TZ at runtime) and asserts `new Date().getTimezoneOffset()` is 420 or 480 before testing. |
| OQ-15 | **Clean-clone `npm run typecheck` before `build` fails with the scaffold's `layout.tsx`**, which uses the generated global `LayoutProps<'/'>` type (it only exists after `next build` or `next typegen`). | `src/app/layout.tsx` in the scaffold. | Never use generated route-type globals. Type layout props explicitly (`{ children: React.ReactNode }`). Then `typecheck` passes before or after `build`. CI order (build → typecheck) is unchanged. |
| OQ-16 | **Tier re-evaluation versus "never step up".** §8.1 says re-evaluate tiers when the motion preference changes, and never step up within a session after `PerformanceMonitor` declines. Context loss → `off`. | §8.1, §8.2, Q15, Q21. | `quality-tier.ts` keeps a session **ceiling** (in memory, never persisted). `PerformanceMonitor` decline lowers the ceiling by one tier. Context loss sets the ceiling to `off` for the session, which stops lose/restore loops. Effective tier = `min(detected(motionPref), ceiling, ?tier override)`. The motion toggle (Q15) re-runs detection under the ceiling, so canvases return if no context loss happened. |
| OQ-17 | **Nav background on lower tiers.** §7.18 says `--ink-0` at 66% (+ blur on high). §5.5 says lower tiers use "solid `--ink-2` at 94%" for small blurred surfaces. Unblurred 66% over the cosmos and content would hurt text contrast. | §5.5, §7.18. | `html[data-tier="high"]` and no reduced transparency → `rgb(10 9 11 / .66)` + `backdrop-filter: blur(18px) saturate(160%)` (with `-webkit-` prefix). Everything else, **including the SSR default before tier detection** → `rgb(20 18 21 / .94)`, no blur. The same rule applies to widget panel, contact menu, modal scrims and gallery HUD chips. |
| OQ-18 | **GitHub Actions versions in the verbatim workflow.** `actions/checkout@v4` and `actions/setup-node@v4` are Node 20-based actions, which GitHub is retiring; they still run (forced onto Node 24) with a deprecation warning. | §15.2 (verbatim). | Keep verbatim (Q29 diffs it). Logged as risk R-11. If a run ever fails for this reason, the Orchestrator bumps to `@v5` and logs a DECISIONS row. |
| OQ-19 | **The `§4.4` tree omits files that other sections require**: `src/lib/motion-tokens.ts` (§10.2), `src/content/derive.ts` (§16.2 Q6), `postcss.config.mjs` (D-003/D-004). | §4.4 vs §10.2, §16.2. | Added to the file tree in §2 with justification. |

---

## 1. Architecture summary

**What it is:** one page (`/`) and a 404 page, generated by Next.js 16.4.2 App Router with `output: 'export'` into `out/` (static HTML, CSS, JS, images, fonts). There is no server runtime.

**Why static export:** Hostinger shared hosting serves files from `public_html`. GitHub Actions builds on every push to `main` and commits `out/` to a `deploy` branch, which Hostinger's Git integration pulls (§4.1, §15). Nobody builds locally. The site works on every Hostinger plan (M-03, M-04).

**Rendering model:**

- **Server Components by default.** Every section is a server component that reads `src/content/site.ts` (and the image manifest via `fs` at build time), so all copy is in `out/index.html` (M-02, M-10).
- **Small client islands in the first-load bundle** (target ≤ 25 KB gz of app code): `MotionProvider` (motion preference store + tier detection + lazy loaders), `ConsoleProvider` (one delegated click listener for `a[data-console]`, lazy-loads overlays), `NavController`, `WhatsAppWidget`, `ContactMenu`, `Accordion`, `MotionToggle`, `GalleryStage`, `HearPhrase` (only if `audioSample`). Springs in these islands use CSS `linear()` easings precomputed in `motion-tokens.ts` (0 KB runtime) or `motion/mini` (4.7 KB) where a JS spring is unavoidable.
- **Deferred enhancement chunks** (loaded with `import()` after hydration on `requestIdleCallback`, fallback `setTimeout(1200)`; never referenced from HTML):
  - `SmoothScroll` (MotionLayer): Lenis + GSAP + ScrollTrigger + SplitText + all scroll reveals, scrubs and chapter tints. Loaded only when motion is on.
  - `OverlayHost`: Radix Dialog + Motion: BookingConsole, LessonsConsole, Lightbox, MobileSheet. Loaded for every visitor (pop-ups must work with motion off too). Prefetched at idle and on first `pointerenter`/`focusin`/`touchstart` of any `[data-console]`, Menu button or gallery tile.
  - `FxLayer`: desktop-only effects (`pointer: fine` and motion on): hero tilt + sheen, card tilt, spotlights, magnetic buttons, CursorFollower.
  - 3D: `CosmosCanvas` and `OrbitGallery` (tiers medium/high only) and the audio analyser (only when `audioSample` is set and clicked).
- **Declarative motion hooks:** server components mark elements with data attributes (`data-reveal="rise|words|fade|line"`, `data-stagger`, `data-scrub="connector|signal|constellation"`, `data-chapter-tint`, `data-fx="tilt|spotlight|magnetic|sheen"`). The deferred layers query and animate them inside a `useGSAP({ scope })`. No copy is duplicated into client components.
- **Shared state outside React** (`src/lib/cosmos-bus.ts`): a tiny mutable store (`warp`, `tint`, `pointer`, `audio`, `dim`) that DOM code writes and the 3D frame loop reads. DOM components never import `three`.

**Static-export constraints (§4.3) and how the plan complies:**

| Constraint | Compliance |
|---|---|
| No Server Actions, middleware, `cookies()`/`headers()`, ISR | None used. Forms are client-only state that builds a `wa.me` URL. |
| No rewrites/redirects/headers in `next.config` | `next.config.ts` is §4.5 verbatim. Headers live in `deploy/htaccess-*`. |
| `next/image` optimisation off | `images.unoptimized: true`; we render our own `<Picture>` from the sharp manifest. |
| No dynamic route handlers or request-time API routes | Only `robots.ts` and `sitemap.ts` with `export const dynamic = 'force-static'` (verified: they export to `out/robots.txt` and `out/sitemap.xml`). |
| `next/dynamic(..., { ssr: false })` only inside client files | All `ssr: false` dynamics live in `MotionProvider.tsx` and `GalleryStage.tsx` (both `'use client'`). |
| Fonts self-hosted | `next/font/google` downloads at build (verified: 10 `.woff2` files in `out/_next/static/media`). |
| 404 | `src/app/not-found.tsx` → `out/404.html` (verified). |

**Tailwind integration (D-003 → D-004):** `@tailwindcss/postcss` 4.3.3 + `postcss.config.mjs` (`plugins: { '@tailwindcss/postcss': {} }`), `globals.css` starts with `@import "tailwindcss";`, theme via `@theme inline`. Verified in a scratch app with the verbatim `next.config.ts`: `next build` (Turbopack) compiled, `text-brass` and `--color-brass` utilities were emitted, `tsc --noEmit` passed. Remove `@tailwindcss/turbopack` and the scaffold's `turbopack.rules`, `cacheComponents`, `partialPrefetching`.

---

## 2. Final file tree

```
.github/workflows/deploy.yml               §15.2 verbatim
.claude/agents/{planner,frontend-designer,qa-tester}.md
deploy/htaccess-root                       §15.3 verbatim
deploy/htaccess-static                     §15.3 verbatim
docs/BUILD-PROMPT.md PLAN.md DECISIONS.md QA-REPORT.md HANDOFF-M1.md … HANDOFF-M4.md
legacy/index.html  legacy/images/*         untouched reference
public/images/*.jpg                        source-of-truth photos (11)
public/audio/.gitkeep                      optional wale-sample.mp3
public/videos/.gitkeep                     optional self-hosted video
scripts/optimize-images.mjs                §14
scripts/prepare-deploy.mjs                 §15.4 verbatim
scripts/bundle-report.mjs                  ADDED (OQ-3): gz sizes of initial / deferred / 3D chunks, --check exits 1 over budget
src/app/layout.tsx page.tsx not-found.tsx globals.css icon.svg robots.ts sitemap.ts
src/content/site.ts                        ALL copy, links, flags, messages (§6, OQ-7)
src/content/derive.ts                      ADDED (§16.2 Q6): pure flag helpers
src/lib/whatsapp.ts                        link builder + message builders + date helpers
src/lib/images.ts                          server-only manifest reader + pickVariant (OQ-8)
src/lib/motion-preference.ts               useSyncExternalStore store, localStorage 'wale-motion'
src/lib/motion-tokens.ts                   ADDED (§10.2): spring specs + CSS linear() strings
src/lib/quality-tier.ts                    detectTier(env), session ceiling, ?tier override
src/lib/cosmos-bus.ts                      ADDED: mutable uniforms bus shared by DOM and 3D
src/lib/overlay-store.ts                   ADDED: which overlay is open + trigger element + origin rect
src/components/layout/  SkipLink Nav NavController MobileSheet Footer MotionToggle ScrollProgress CosmosPoster
src/components/sections/ Hero HeroPortrait HearPhrase Paths ChapterMarker WhyLive Occasions PullQuote
                         BookingSteps Testimonials Coverage Constellation LessonsIntro LessonsPAS LessonsWho
                         LessonsPath LessonsFormats Gallery GalleryStage DomGallery Faq FinalCta JsonLd
src/components/overlays/ ConsoleProvider OverlayHost ContactMenu WhatsAppWidget BookingConsole LessonsConsole
                         Lightbox BottomSheet MessagePreview ChipGroup
src/components/ui/       Button Picture Eyebrow SectionHeading RichText Chip HudFrame Magnetic CursorFollower
                         Accordion Icon
src/components/three/    CosmosCanvas Cosmos BrassDust SoundRibbon CosmosEffects OrbitGallery GalleryPlane
                         BrassCore OrbitLines useQualityTier shaders/{dust,gallery,core}.ts
src/components/providers/ MotionProvider SmoothScroll FxLayer
src/components/audio/    audio-analyser.ts     ADDED (§8.6): dynamic-imported AudioContext + AnalyserNode
tests/                   Playwright specs (see §11/§12 of this plan)
postcss.config.mjs                         ADDED (D-004)
playwright.config.ts lighthouserc.json .nvmrc .gitattributes next.config.ts eslint.config.mjs tsconfig.json
```

Justification for every addition: `bundle-report.mjs` (OQ-3), `derive.ts` (required by Q6), `motion-tokens.ts` (named in §10.2), `cosmos-bus.ts` and `overlay-store.ts` (keep `three` and Radix out of the first-load bundle, OQ-1), `postcss.config.mjs` (D-004), `RichText`/`Icon`/`ChipGroup`/`MessagePreview`/`BottomSheet` (shared pieces that stop copy and markup duplication), `CosmosPoster` (the CSS poster of §8.5 needs a home), `audio-analyser.ts` (§8.6 requires a dynamic import), `JsonLd` (§13). `MobileSheet` sits in `layout/` per §4.4 but is rendered by `OverlayHost` (deferred) so Radix stays out of first load. Delete the scaffold's `src/app/page.tsx` placeholder content and `public/*.svg` (already gone).

---

## 3. Dependencies (exact versions, verified 22 Oct 2026)

Verified with `npm view <pkg> version` and a throwaway `npm install` of the complete set in `…/scratchpad/plan-deps` (plain `npm install`, no `--force`, no `--legacy-peer-deps`): **added 804 packages, exit 0, no ERESOLVE, no peer warnings**. `npm ls` shows a single deduped `three@0.186.1` for fiber, drei, postprocessing, maath and three-stdlib (exception: drei's optional `stats-gl` nests `three@0.170.0`; it is only bundled if `StatsGl` is imported, which is forbidden). The lockfile contains all four Linux natives (§17 pitfall 28): `@img/sharp-linux-x64`, `@tailwindcss/oxide-linux-x64-gnu`, `lightningcss-linux-x64-gnu`, `@next/swc-linux-x64-gnu`. sharp 0.35.5 loaded and encoded AVIF on this Intel macOS 12 machine.

Pin **exact** versions (no `^`) in `package.json` (D-005).

**dependencies**

| Package | Version | Peer check |
|---|---|---|
| `next` | 16.4.2 | react `^18.2 \|\| ^19.0.0` ✔ |
| `react` / `react-dom` | 19.3.1 / 19.3.1 | upgrade from scaffold 19.3.0; fiber needs `>=19 <19.4` ✔ |
| `three` | 0.186.1 | postprocessing needs `>=0.168 <0.187` ✔ |
| `@react-three/fiber` | 9.8.2 | react `>=19 <19.4`, three `>=0.156` ✔ |
| `@react-three/drei` | 10.7.9 | fiber `^9.0.0`, three `>=0.159` ✔ |
| `@react-three/postprocessing` | 3.2.2 | fiber `>=9.7.0`, postprocessing `^6.36.0` ✔ |
| `postprocessing` | 6.39.5 | three `>=0.168 <0.187` ✔ (**do not** move three to 0.187+ without bumping this) |
| `maath` | 0.10.8 | three + @types/three `>=0.134` ✔ |
| `gsap` | 3.15.0 | ScrollTrigger + SplitText included |
| `@gsap/react` | 2.1.2 | gsap `^3.12.5` ✔ |
| `lenis` | 1.3.27 | react `>=17` ✔ |
| `motion` | 14.6.0 | react `^18 \|\| ^19` ✔ |
| `@radix-ui/react-dialog` | 1.3.1 | react `^19.0` ✔ |
| `simple-icons` | 16.35.0 | named imports tree-shake (2 icons = 1.9 KB) |

**devDependencies**

| Package | Version | Note |
|---|---|---|
| `typescript` | 5.9.3 | keep 5.x (latest is 7.0.2 — forbidden) |
| `eslint` | 9.39.5 | keep 9.x (latest is 10.13.0 — forbidden) |
| `eslint-config-next` | 16.4.2 | |
| `tailwindcss` / `@tailwindcss/postcss` | 4.3.3 / 4.3.3 | **remove** `@tailwindcss/turbopack` |
| `@types/node` | 22.20.5 | matches `.nvmrc` 22 (scaffold had ^20) |
| `@types/react` / `@types/react-dom` | 19.3.0 / 19.3.0 | |
| `@types/three` | 0.186.0 | maath peer; types for three |
| `sharp` | 0.35.5 | image pipeline |
| `@playwright/test` | 1.64.1 | use `channel: 'chrome'` (D-002) |
| `@axe-core/playwright` | 4.14.0 | |
| `@lhci/cli` | 0.15.1 | `chromePath` from `LHCI_CHROME_PATH` (OQ-4) |
| `serve` | 14.2.6 | `npm run preview` |

Install command for M1 (one shot, in the repo): `npm uninstall @tailwindcss/turbopack && npm install --save-exact <deps> && npm install --save-exact -D <devDeps>`; then check the four Linux natives in `package-lock.json`. Playwright 1.64 does not download browsers on install (D-002).

---

## 4. Component inventory

### 4.1 `site.ts` key map (shape the Designer implements; §6.2 names kept, extended)

Root keys from §6.2 unchanged: `siteUrl name fullName role base whatsapp phoneHref instagram photoCredit stats performance lessons areas audioSample gallery`. Added keys (all copy from §6 verbatim; headings use `*emphasis*` markup that `RichText` renders as `<em>` italic brass):

`seo{title,description}` · `ui{skipLink,menu,close,motionLabel,motionOn,motionOff,newTab}` · `nav{links[{label,href}],cta}` · `widget{ariaLabel,chip,title,status}` · `contactOptions[{kind:'booking'|'lessons'|'general',label}]` · `footer{tagline,whatsappLabel,instagramLabel,copyright}` · `hero{eyebrow,h1Words[],h1EmphasisIndex,lead,primaryCta,secondaryCta,microcopy,image{file,alt},hearPhrase,stop}` · `paths{eyebrow,heading,cards[{label,title,body,bodyNoYoung?,link,href}]}` · `chapters{performances,lessons,watch}` · `why{eyebrow,heading,body,emphasis,features[{n,title,body}]}` · `occasions{eyebrow,heading,cards[{image,title,body,alt}],footer,cta}` · `pullQuote{quote,caption,placeholder}` · `bookingSteps{eyebrow,heading,steps[{n,title,body}],genresLabel,yourSong}` · `hosts{eyebrow,heading,cards[{quote,name,meta,placeholder}]}` · `coverage{eyebrow,heading,body,lessonsBody,moreChip,note,mapCaption,baseLabel}` · `lessonsIntro{eyebrow,heading,leadHome,leadOnline,leadBoth,cta,microTrial,microDefault,image{file,alt}}` · `lessonsPas{eyebrow,heading,p1,p2,p3}` · `lessonsWho{eyebrow,heading,cards[{key,title,body}],minAgeSuffix}` · `lessonsPath{eyebrow,heading,intro,stages[{n,title,body}]}` · `lessonsFormats{eyebrow,heading,cards{home,online,group},lengthSuffix,priceFallback,instrumentNote,cta}` · `students{…same as hosts}` · `watch{eyebrow,heading,instagramLink,hint,counterSep}` · `faq{eyebrow,heading,groups{performances,lessons},items{…question/answer variants per §6.10}}` · `finalCta{eyebrow,heading,body,cta1,cta2,callPrefix}` · `notFound{eyebrow,heading,body,home}` · `consoles{booking{title,subtitle,occasions[],dateLabel,dateUnfixed,location,locationPlaceholder,guests[],notes,notesPlaceholder,preview,send,sayHi},lessons{title,subtitle,who[],age,experience[],formats{home,online,group,notSure},area,days[],flexible}}` · `lightbox{close,prev,next,counter,announce,watchOnInstagram,watchOnYouTube,playVideo}` · `gallery3d{drag,prevItem,nextItem}` · `messages{bookingIntro,bookingLabels{occasion,date,location,guests},dateNotFixed,lessonsIntro,lessonsLabels{who,age,experience,format,area,days},generalIntro}`.

`derive.ts` (pure, unit-tested by Q6): `pathsCards(s)`, `coverageParagraphs(s)`, `lessonsLead(s)` (throws per OQ-9), `lessonsMicrocopy(s)`, `whoCards(s)`, `lessonFormats(s)`, `formatPriceLine(s)`, `faqItems(s)`, `lessonsConsoleQuestions(s)`, `galleryItems(s)` (validates 1–24 items), `videoAction(item)` (OQ-13), `footerName(s)`, `instagramLink(s)`, `placeholderList(s)` (feeds README and Q27).

### 4.2 Components

S = server component, C = client (first-load), D = client in a deferred chunk. Content keys are relative to `site`.

| Component | File | Kind | Props | Content keys | M-IDs |
|---|---|---|---|---|---|
| RootLayout | `src/app/layout.tsx` | S | `{children}` | `seo`, `siteUrl` | M-01, M-03, M-13, M-16 |
| Page | `src/app/page.tsx` | S | — | (composes sections) | M-02, M-08 |
| NotFound | `src/app/not-found.tsx` | S | — | `notFound` | M-03, M-12 |
| robots / sitemap | `src/app/robots.ts`, `sitemap.ts` | S | — | `siteUrl` | M-03 |
| JsonLd | `sections/JsonLd.tsx` | S | — | `name fullName siteUrl whatsapp base instagram` | M-09 |
| SkipLink | `layout/SkipLink.tsx` | S | — | `ui.skipLink` | M-12 |
| CosmosPoster | `layout/CosmosPoster.tsx` | S | — | — | M-14, M-17 |
| Nav | `layout/Nav.tsx` | S | — | `name role nav ui.menu` | M-06, M-07, M-12, M-18 |
| NavController | `layout/NavController.tsx` | C | `{children}` | — | M-12 (focus-within keeps nav visible) |
| ScrollProgress | `layout/ScrollProgress.tsx` | S | — | — (CSS `animation-timeline: scroll()`, hidden where unsupported) | M-13 |
| MobileSheet | `layout/MobileSheet.tsx` | D | `{open,onOpenChange}` | `nav ui` | M-12, M-13 |
| Footer | `layout/Footer.tsx` | S | — | `footer whatsapp instagram photoCredit fullName` | M-05, M-08, M-18 |
| MotionToggle | `layout/MotionToggle.tsx` | C | `{variant:'footer'\|'sheet'}` | `ui.motionLabel/On/Off` | M-13 |
| Hero | `sections/Hero.tsx` | S | — | `hero stats audioSample` | M-01, M-02, M-07, M-15 |
| HeroPortrait | `sections/HeroPortrait.tsx` | S | `{picture}` (data-fx="tilt sheen") | `hero.image` | M-11, M-15 |
| HearPhrase | `sections/HearPhrase.tsx` | C | `{src}` | `hero.hearPhrase hero.stop` | M-13 (no autoplay) |
| Paths | `sections/Paths.tsx` | S | — | `paths lessons.youngLearners` | M-08 |
| ChapterMarker | `sections/ChapterMarker.tsx` | S | `{label, tint:'wine'\|'neutral'\|'amber'\|'deep'\|'dim'\|'bloom'}` | `chapters.*` | M-08 |
| WhyLive | `sections/WhyLive.tsx` | S | — | `why` | M-01, M-08 |
| Occasions | `sections/Occasions.tsx` | S | — | `occasions` | M-08, M-11 |
| PullQuote | `sections/PullQuote.tsx` | S | — | `pullQuote` | M-09 |
| BookingSteps | `sections/BookingSteps.tsx` | S | — | `bookingSteps performance.genres` | M-08 |
| Testimonials | `sections/Testimonials.tsx` | S | `{id:'hosts'\|'students'}` | `hosts` / `students` | M-09 |
| Coverage | `sections/Coverage.tsx` | S | — | `coverage areas lessons.home` | M-08 |
| Constellation | `sections/Constellation.tsx` | S | `{areas}` (SVG `aria-hidden`, chip↔node highlight via CSS `:has()`) | `areas coverage.baseLabel` | M-12 |
| LessonsIntro | `sections/LessonsIntro.tsx` | S | — | `lessonsIntro lessons.*` | M-07, M-08 |
| LessonsPAS | `sections/LessonsPAS.tsx` | S | — | `lessonsPas` | M-08 |
| LessonsWho | `sections/LessonsWho.tsx` | S | — | `lessonsWho lessons.youngLearners` | M-08 |
| LessonsPath | `sections/LessonsPath.tsx` | S | — | `lessonsPath` | M-08 |
| LessonsFormats | `sections/LessonsFormats.tsx` | S | — | `lessonsFormats lessons.*` | M-08, M-09 |
| Gallery | `sections/Gallery.tsx` | S | — | `watch gallery instagram chapters.watch` | M-08, M-11 |
| GalleryStage | `sections/GalleryStage.tsx` | C | `{items: GalleryItemData[], labels}` (image data from server) | via props | M-12, M-14 |
| DomGallery | `sections/DomGallery.tsx` | S-rendered markup, used inside GalleryStage as children | `{items}` | `gallery` | M-11, M-14 |
| Faq | `sections/Faq.tsx` | S | — | `faq performance lessons` via `faqItems()` | M-08, M-12 |
| FinalCta | `sections/FinalCta.tsx` | S | — | `finalCta whatsapp phoneHref` | M-05, M-07 |
| ConsoleProvider | `overlays/ConsoleProvider.tsx` | C | `{children}` | — | M-07 |
| OverlayHost | `overlays/OverlayHost.tsx` | D | — | — | M-12 |
| BookingConsole | `overlays/BookingConsole.tsx` | D | `{open,onOpenChange,origin}` | `consoles.booking areas messages` | M-05, M-12 |
| LessonsConsole | `overlays/LessonsConsole.tsx` | D | `{open,onOpenChange,origin}` | `consoles.lessons lessons areas messages` | M-05, M-12 |
| MessagePreview | `overlays/MessagePreview.tsx` | D | `{text}` (`aria-live="off"`) | `consoles.booking.preview` | M-05 |
| ChipGroup | `overlays/ChipGroup.tsx` | D | `{legend,name,type:'radio'\|'checkbox',options,value,onChange}` | via props | M-12 |
| BottomSheet | `overlays/BottomSheet.tsx` | D | `{children,onDismiss}` | — | M-12, M-13 |
| Lightbox | `overlays/Lightbox.tsx` | D | `{items,index,originRect,onIndex,onClose}` | `lightbox` | M-11, M-12 |
| WhatsAppWidget | `overlays/WhatsAppWidget.tsx` | C | — | `widget contactOptions` | M-05, M-06, M-07, M-18 |
| ContactMenu | `overlays/ContactMenu.tsx` | C | `{anchorId}` | `contactOptions` | M-05, M-06 |
| Button | `ui/Button.tsx` | S | `{href, variant:'primary'\|'outline', size:'S'\|'M'\|'L'\|'XL', console?:'booking'\|'lessons', magnetic?, icon?:'arrow'\|'whatsapp', external?}` | — | M-05, M-07, M-12 |
| Picture | `ui/Picture.tsx` | S | `{name, alt, sizes, priority?, className?}` | image manifest | M-11, M-15 |
| Eyebrow | `ui/Eyebrow.tsx` | S | `{children, tone:'brass'\|'muted', liveDot?}` | — | M-01 |
| SectionHeading | `ui/SectionHeading.tsx` | S | `{id, as:'h1'\|'h2', size:'h1'\|'h2'\|'final', text, reveal?}` | — | M-01, M-12 |
| RichText | `ui/RichText.tsx` | S | `{text}` (`*x*` → `<em>`) | — | M-01, M-10 |
| Chip | `ui/Chip.tsx` | S | `{children, highlight?, as:'li'\|'span'}` | — | M-01 |
| HudFrame | `ui/HudFrame.tsx` | S | `{children, leg?:14\|16\|18, className?}` | — | M-17 |
| Magnetic | `ui/Magnetic.tsx` | S | `{children}` (adds `data-fx="magnetic"`) | — | M-13 |
| CursorFollower | `ui/CursorFollower.tsx` | D (FxLayer) | — | `gallery3d.drag` | M-13 |
| Accordion | `ui/Accordion.tsx` | C | `{items:{id,q,a}[]}` | via props | M-12 |
| Icon | `ui/Icon.tsx` | S | `{name, size}` (stroke SVGs + `siWhatsapp`, `siInstagram`) | — | M-17 |
| MotionProvider | `providers/MotionProvider.tsx` | C | `{children}` | — | M-13, M-14, M-15 |
| SmoothScroll | `providers/SmoothScroll.tsx` | D | — | — | M-13 |
| FxLayer | `providers/FxLayer.tsx` | D | — | — | M-13 |
| CosmosCanvas | `three/CosmosCanvas.tsx` | D (3D) | `{tier}` | — | M-14, M-15 |
| Cosmos, BrassDust, SoundRibbon, CosmosEffects | `three/*.tsx` | D (3D) | `{tier, count}` | — | M-14 |
| OrbitGallery, GalleryPlane, BrassCore, OrbitLines | `three/*.tsx` | D (3D) | `{items, index, onIndex, onOpen, tier}` | via props | M-11, M-12, M-14 |
| useQualityTier | `three/useQualityTier.ts` | C hook | — | — | M-14 |

---

## 5. Section-by-section build spec with motion beats

Common rules: container `max-width:1200px; padding-inline:clamp(16px,4vw,40px)`; section padding `clamp(72px,8vw,112px)` (final CTA `clamp(88px,10vw,136px)`); `scroll-margin-top: 88px` on every section (native and no-JS anchors); every section `aria-labelledby` its H2. "Reveal" = ScrollTrigger at `top 80%`, `once: true`, initial hidden state set by `gsap.set` inside SmoothScroll only (pitfall 13). Elements already above the trigger when SmoothScroll mounts are left visible (no late re-hide).

| # | Section (id) | Layout | Motion beats (motion on) | Motion off / no JS |
|---|---|---|---|---|
| 0 | Nav (`header`) | wordmark · 4 links · Message Wale; < 860px: wordmark · Message Wale · Menu | hide on scroll-down after 400px, show on scroll-up (`transform` only, spring `ui` via CSS `linear()`); never hidden while `:focus-within`; scroll-progress hairline (CSS scroll timeline) | static sticky nav; links are anchors; Message Wale = general `wa.me` |
| 1 | Hero (`#top`) | 2 cols ≥ 900px (copy `minmax(460px,1fr)`, portrait ≤ 500px, right); stacked < 900px | **CSS only, pre-hydration**: rails scaleY 0→1 (18ms stagger) → eyebrow fade → H1 words rise 0.35em, blur 8→0, 70ms stagger, 900ms `cubic-bezier(.2,.8,.2,1)` → lead/CTAs/stats +180ms steps; total ≤ 1.4s. Portrait: scale 1.03→1 + brightness, never opacity 0; HUD ticks draw (stroke-dashoffset). FxLayer: tilt ≤ 6° perspective 1200px, sheen soft-light 8–12%, hover scanline. Coral dot breathe 2.4s. | gated by `@media (prefers-reduced-motion: no-preference)` and `html:not([data-motion="off"])`; everything visible at t=0 |
| 2 | Paths (`#paths`) | 2 HudFrame cards ≥ 760px, stacked below | reveal rise, 120ms stagger; orbit SVG dot 12s loop (CSS, paused when off); FxLayer tilt ≤ 8° + inner translateZ 20px; click → Lenis scroll with -80 offset + `cosmos-bus.warpBurst(600ms)` | anchor jump; orbit static |
| 3 | Chapter marker I | hairline + centred label + brass ticks | line scaleX from centre, then label fade; sets tint `wine` (ScrollTrigger `onToggle`) | static |
| 4 | Why live sax (`#why`) | heading left / paragraphs right ≥ 900px; features 3-col (min 280px) with top hairline | SplitText words (mask, y 100%→0, 40ms) after `document.fonts.ready`; one 1.2s shimmer on the italic word | plain text |
| 5 | Occasions (`#occasions`) | 4-up ≥ 1100, 2-up tablet, 1-up phone; 4:5 images | reveal 90ms stagger; hover (fine): img scale 1.035/700ms, one scanline sweep, pointer spotlight via CSS vars (FxLayer) | static; CTA = booking `wa.me` |
| 6 | Pull quote | centred ≤ 900px, oversized brass “ | words fade, 25ms stagger | static; dashed placeholder treatment |
| 7 | Booking steps (`#booking-steps`) | 3 `--ink-2` cards; connector horizontal desktop / vertical phone; genres row | connector draws with scrub (no pin) | connector fully drawn |
| 8 | Hosts (`#hosts`) | 3-col, stacked phone, no carousel | cards float up with translateZ, 100ms stagger | static |
| 9 | Coverage (`#coverage`) | constellation left / copy + chips right; stacked phone | Ajah→node lines draw (stroke-dashoffset scrub); Ajah ring pulse (CSS); chip↔node highlight via `:has()` (works without JS); tint `neutral` | lines drawn, no pulse |
| 10 | Chapter marker II | as 3 | as 3; tint `amber` | static |
| 11 | Lessons intro (`#lessons`) | copy + CTA left, `wale-sax-detail.jpg` in HudFrame + edge mask right | reveal rise; tint `amber` | static |
| 12 | Lessons PAS (`#lessons-why`) | single column ≤ 760px | P1, P2, P3 one by one; brass hairline draws above P3 ("the turn") | static |
| 13 | Who it’s for (`#lessons-who`) | 2×2, 1-up phone, line icons | reveal; FxLayer tilt ≤ 4° + spotlight | static |
| 14 | Learning path (`#lessons-path`) | desktop: sticky left (`top:96px`) + right flight-path line; phone single column | brass signal scrubbed down the line; nodes ignite (scale 1→1.25 + glow) as passed | line + all nodes lit |
| 15 | Formats (`#lessons-formats`) | enabled cards (1 card → max-width 560px) + note + CTA | reveal | static |
| 16 | Students (`#students`) | as Hosts | as Hosts | static |
| 17 | Chapter marker III · Watch | as 3 | tint `deep` | static |
| 18 | Gallery (`#gallery`) | 3D: height `clamp(560px,82svh,880px)` + DOM HUD (prev/next 44px, counter `01 / 05`, caption, hint, Instagram link); fallback: 16:9 tile + 2×2 squares (+3-col overflow) | slots fly in from deep z (60ms stagger), orbit lines draw, core ignites; canvas paused off-screen | DOM grid; Lightbox works; no hint |
| 19 | FAQ (`#faq`) | ≤ 880px; two labelled groups | accordion height spring `ui` (`motion/mini` or CSS `linear()`), plus icon rotates 45°; tint `dim` | instant toggle; with no JS answers are visible (SSR renders open; JS collapses on mount) |
| 20 | Final CTA (`#contact`) | centred, rails background | wine nebula bloom rises (tint `bloom`); 2 magnetic XL buttons (FxLayer) | static; CTAs are `wa.me` |
| 21 | Footer | wordmark + tagline + links + Motion toggle; bottom padding ≥ 104px | — | toggle hidden without JS (`<noscript>`-safe: rendered only after mount) |
| 22 | 404 | eyebrow, H1, body, home button, widget, cosmos poster | none | same |

FAQ no-JS rule: answers are server-rendered expanded; `Accordion` collapses them after hydration (no flash because the FAQ is below the fold). This keeps answers readable with JS off (M-07 spirit, M-02).

---

## 6. 3D plan

### 6.1 Tier detection (`src/lib/quality-tier.ts`)

`detectTier(env)` is pure (unit-testable): inputs `{reducedMotion, motionToggle, webgl2, saveData, deviceMemory?, cores?, coarse, width, override?}` → `'off'|'low'|'medium'|'high'` per §8.1 order: off → low → medium → high. Guarded reads (`'deviceMemory' in navigator`). WebGL2 probe: create a canvas, `getContext('webgl2')`, then `WEBGL_lose_context.loseContext()` on the probe to free it. `?tier=` override read once from `location.search`, never persisted. Session ceiling per OQ-16. Result written to `html[data-tier]` (drives CSS: blur, nav, gallery height).

| Tier | Cosmos | Gallery | Post | DPR | Particles |
|---|---|---|---|---|---|
| off | poster | DOM grid | — | — | — |
| low | poster | DOM grid | — | — | — |
| medium | dust only | 3D, no bend, RGB split clamp 0.004 | none | `[1,1.5]` | 2,500 |
| high | dust + ribbon | 3D full, RGB split clamp 0.012 | Bloom(mipmapBlur, threshold 0.6, intensity 0.6) + Noise(0.04) + Vignette | `[1,1.75]` | 6,000 |

### 6.2 Cosmos (`CosmosCanvas` → `Cosmos`)

- Loaded by `MotionProvider` via `next/dynamic(() => import('@/components/three/CosmosCanvas'), { ssr:false })` only when tier ∈ {medium, high}, after `window.load` + `requestIdleCallback` (fallback 1200ms).
- `<Canvas>`: fixed, `inset:0`, `z-index:-1`, `pointer-events:none`, `aria-hidden`, `dpr={[1,cap]}`, `gl={{antialias:false, powerPreference:'high-performance', alpha:true}}`, `frameloop` = `'always'` while visible, `'never'` when `document.hidden` or tier → off. Wrapper opacity 0 → 1 over 1.2s after the first `useFrame` tick (`onCreated` + one frame). `CosmosPoster` stays underneath.
- **BrassDust**: `THREE.Points`, `BufferGeometry` with `position`, `color`, `size`, `seed` attributes generated once (seeded PRNG). Spiral disc tilted ~18°, rotation `2π / 360s`; sparse outer field 15% of count. Colour mix 75% brass `#D4A64A`, 15% ivory `#F4EFE6`, 10% wine `rgb(122,14,34)`. Density mask: particles whose projected x is inside the central text column are culled to 35% at generation time (screen-space band ±0.22 NDC). `ShaderMaterial` (`shaders/dust.ts`): soft round sprite from `gl_PointCoord`, alpha ≤ 0.6, `AdditiveBlending`, `depthWrite:false`, size attenuation.
- **Uniforms** (`dust.ts`): `uTime` (clock), `uWarp` (damped 0–1: normalised `|lenis.velocity|/40` clamped + bursts from `cosmos-bus.warp`; vertex stretches along screen-space Y, +15% brightness), `uTint` (vec3 damped toward the chapter target; targets: wine-warm `#C9895A`, neutral `#D9CFC2`, amber-brass `#E2BE6E`, deep neutral `#9C948A`, dim `#6E675F`, wine bloom `#B0485A`, all derived from brass/ivory/wine), `uPointer` (vec2 damped; camera offset ≤ 0.15 units, fine pointers only), `uAudio` (0–1), `uPixelRatio`. Damping with `maath/easing.damp`/`damp3`.
- **SoundRibbon** (high only): `TubeGeometry(curve, 160, 0.012, 8)` along a `CatmullRomCurve3` of 9 points right of the portrait; points displaced per frame by a low-frequency sine (period ≥ 8s; never 0.2 Hz oscillation) + `uAudio`; geometry rebuilt at most every 2nd frame by updating the position attribute in place (no reallocation). `MeshPhysicalMaterial {color:'#D4A64A', metalness:1, roughness:0.28, clearcoat:0.6}`. Lighting: drei `<Environment resolution={256}>` containing 3 `<Lightformer>`s (warm key, ivory rim, wine fill). **No `preset`, no `files`** (M-16).
- **CosmosEffects** (high only): `<EffectComposer multisampling={0}>`.
- **Lifecycle**: `visibilitychange` → frameloop never/always; `webglcontextlost` on `gl.domElement` → `event.preventDefault()` not called (we do not restore), set ceiling `off`, unmount; R3F disposes scene objects on unmount; manual `dispose()` for the generated geometry, the ShaderMaterial, the PMREM env texture (drei handles), and the composer. Strict-mode double mount safe (all listeners removed in cleanup).

### 6.3 Orbit Gallery (`GalleryStage` → `OrbitGallery`)

- `GalleryStage` (client, first-load) renders the DOM HUD, the visually hidden keyboard list (`<ul>` of `<button>`s, one per unique item, `aria-label="{alt}"`), the `aria-live="polite"` region ("Photo 3 of 5: {alt}", from `site.lightbox.announce`), and either `DomGallery` (tier off/low, or until the canvas is ready) or the 3D shell. It dynamic-imports `OrbitGallery` when tier ≥ medium **and** the section is within `rootMargin: 100% 0px` (IntersectionObserver).
- **Scene**: slots = `max(N, 10)` (slot `i` → item `i % N`); ring radius 2.6, camera at `(0, 0.55, 6.2)` looking at `(0, 0, 0)` (slightly down). `GalleryPlane`: `PlaneGeometry(0.8, 1, 32, 1)` scaled ×1.35; vertex shader bends onto the ring cylinder (`uBend` = high only, scaled by `|uVelocity|`). `BrassCore`: `IcosahedronGeometry(0.32, 1)`, `MeshStandardMaterial({ color:'#D4A64A', emissive:'#D4A64A', emissiveIntensity:1.4 })`, rotation 0.1 rad/s. `OrbitLines`: two `LineLoop`s (r 2.9 and 3.1, tilts 6° and −4°), brass at 35% alpha.
- **Textures**: drei `useTexture` with `pickVariant(entry, 1200, 'webp')` URLs (OQ-8), `colorSpace = SRGBColorSpace`, `anisotropy = min(8, gl.capabilities.getMaxAnisotropy())`, `generateMipmaps` on. One texture per unique item (repeated slots share it).
- **Shader uniforms** (`shaders/gallery.ts`): `uMap`, `uImageAspect`, `uPlaneAspect` (cover-fit: `scale = uPlaneAspect > uImageAspect ? vec2(1, uImageAspect/uPlaneAspect) : vec2(uPlaneAspect/uImageAspect, 1)`; `uv = (vUv - .5) * scale + .5` — never stretches, M-11), `uHover` (spring 0–1: scanlines, +6% brightness, +0.08 forward along normal), `uVelocity` (bend + RGB split ∝ `|v|`, clamped 0.012 high / 0.004 medium), `uDim` (0–1 while Lightbox open; also pushes ring back 0.6 units), `uActive`, `uIntro` (fly-in). Fragment ends with `#include <tonemapping_fragment>` and `#include <colorspace_fragment>`; `toneMapped={false}` on the material and `gl.toneMapping = NoToneMapping` for the gallery canvas so a centred plane matches the DOM `<img>` (Q22 < 6% luminance).
- **Input** (Pointer Events on the canvas wrapper): `setPointerCapture`; history of `{t, x}` for 100ms; drag commits after 6px; rotation follows 1:1 from the grab angle; release velocity → `projected = current + (v/1000) * 0.998 / (1 - 0.998)` (angle units) → nearest slot; spring `snap` if `|v| < 0.5 rad/s` else `flick`, started from the live angle with the release velocity (`motion/mini` `animate` with `velocity`), interruptible on `pointerdown`. Tap (< 250ms, < 6px) on a plane (R3F raycast) → `openLightbox(itemIndex, projectedRect(plane))` projecting the 4 corners with the camera. Wheel: handled only if `|deltaX| > |deltaY|` or `shiftKey`; vertical wheel never `preventDefault`ed (pitfall 15). Keyboard list: ←/→ rotate one item, Enter/Space opens. Prev/next buttons 44px.
- **Entrance**: on first intersection, `uIntro` per slot 0→1 with 60ms stagger (z from −8), lines draw (`drawRange`), core emissive 0→1.4.
- **Lifecycle**: IntersectionObserver toggles `frameloop` `'always'`/`'never'`; `PerformanceMonitor` `onDecline` lowers ceiling; context loss → ceiling `off` → swap to `DomGallery` keeping the current index; dispose textures (`useTexture.clear(urls)` on unmount) and geometries.

### 6.4 Shaders

`src/components/three/shaders/{dust,gallery,core}.ts`, exported as `/* glsl */` template strings. No `.glsl` imports (pitfall 10). No GLSL `#include`s other than three's built-in chunks.

### 6.5 Fallbacks (M-14)

- `CosmosPoster` (always rendered, server): `--ink-0` + radial wine glow bottom-left (40%) + brass haze top-right (10%) + light rails + starfield (`radial-gradient` dots in a 240px tile, ≤ 6% opacity). Fixed, `z-index:-2`, `aria-hidden`.
- Gallery: `DomGallery` (legacy layout: 16:9 + 2×2, extra items 3-col), each tile a `<button>` opening the Lightbox with its rect; with no JS the tiles are plain `<img>`s (no Lightbox, nothing lost).
- Every failure path (no WebGL2, `import()` rejects, `Canvas onCreated` throws via an error boundary, context loss, PerformanceMonitor decline to low) ends in the poster + DOM grid. An `ErrorBoundary` wraps each canvas and sets ceiling `off` on error without logging to `console.error` (Q2/Q21).

### 6.6 Audio (§8.6)

`HearPhrase` renders only when `site.audioSample` is set. On click, `import('@/components/audio/audio-analyser')` creates an `AudioContext`, `MediaElementSource` → `AnalyserNode (fftSize 256)` → destination; average bins 2–40 → `cosmos-bus.audio` (damped in the frame loop). Button label toggles `hearPhrase`/`stop`; `ended` resets. With motion off the audio plays and `cosmos-bus.audio` is not written.

---

## 7. Pop-up plan

**Store** (`overlay-store.ts`, `useSyncExternalStore`): `{ open: null|'booking'|'lessons'|'lightbox'|'sheet', trigger: HTMLElement|null, originRect, lightboxIndex }`. `ConsoleProvider` installs one capturing `click` listener on `document` for `a[data-console]` and `[data-open="sheet"]`. Intercept only when `OverlayHost` is loaded (`html[data-overlays="ready"]`), the click is a plain primary click (no Ctrl/Meta/Shift/Alt, `button === 0`). If not ready, the link opens WhatsApp natively (M-07). QA waits for `html[data-overlays="ready"]` before pop-up tests.

| Concern | Consoles / Lightbox / Mobile Sheet (Radix Dialog, deferred) | Widget panel / Contact Menu (disclosure popover, first-load) |
|---|---|---|
| Open | `Dialog.Root open` controlled by the store (no `Dialog.Trigger`; triggers are our `<a>`s) | trigger `<a aria-expanded aria-controls>`; panel rendered in place |
| Materialise | Motion: scale 0.96→1, opacity 0→1, `transform-origin` = trigger centre relative to panel; scrim `--ink-0`/70% (blur 0→16px on high tier only); spring `ui`. Motion off: 150ms opacity cross-fade. Phones (< 640px): consoles render inside `BottomSheet` (y 100%→0, spring `sheet`) | CSS: same scale/opacity from origin bottom-right (widget) / top-right (menu) with `linear()` spring `ui`; options stagger 40ms; motion off: 150ms fade |
| Focus in | `onOpenAutoFocus`: preventDefault, focus the first meaningful control (consoles: first occasion/who radio; Lightbox: the Next button, or Close when there is one item; sheet: first link) | focus first option link |
| Focus trap | Radix (`FocusScope`) | not trapped (non-modal disclosure); Tab past the last option closes it |
| Esc | Radix → store close | `keydown` Escape → close, focus trigger |
| Outside click | Radix overlay | `pointerdown` outside panel and trigger → close |
| Return focus | `onCloseAutoFocus`: preventDefault, `store.trigger?.focus({preventScroll:true})` (exact trigger, Q9) | `trigger.focus()` |
| Lenis | `useLenis()` in OverlayHost: `lenis?.stop()` when any dialog opens, `lenis?.start()` on close (also in cleanup); `data-lenis-prevent` on every scrollable dialog body | not stopped (non-modal) |
| Scroll lock / inert | Radix (`react-remove-scroll` + `aria-hidden` siblings) | none |
| Close button | 44px `<button aria-label={site.ui.close}>` | same |
| Press | `.press:active { transform: scale(.97); transition: 80ms ease-out }` applied on pointerdown (CSS `:active`; iOS needs `ontouchstart` on body — set in layout) | same |
| Exit | reverse of entrance (to trigger origin / back into Lightbox origin rect, re-measured) | reverse |

**Consoles**: fields per §9.2/§9.3 as native inputs inside `<fieldset><legend>`; chips are `<input type=radio|checkbox>` with visible focus. Date `min` set in `useEffect` (never during render). Send = `<a href={waLink(message)} target="_blank" rel="noopener">` re-rendered on every change (no `window.open`, pitfall 17). Lessons Console question set from `lessonsConsoleQuestions(site)`; age shown only for "My child"/"Someone else"; area shown when Home selected or home is the only format.

**Lightbox**: content = `<picture>` with `pickVariant(…,1600)`, caption, counter, prev/next, close; video items per §9.5 (`<video controls playsInline preload="none" poster>` or external button from `videoAction`). ←/→ navigate. Touch: horizontal swipe navigate (6px threshold, velocity projection), vertical drag-down dismiss (1:1, rubber-band upward `y * 0.35`, dismiss when projected > 30% viewport height or v > 800px/s, else spring back `sheet`). Sets `cosmos-bus.dim = 1` while open.

**Mobile Sheet**: Radix Dialog inside `BottomSheet`; 4 links + Message Wale + MotionToggle; drag-to-dismiss 1:1 with rubber-band above the open position, projected position > 50% sheet height → dismiss, else spring `sheet`. Link tap: close, then after the exit (`onAnimationComplete`) `lenis.scrollTo('#id', {offset:-80})` or `element.scrollIntoView()` when Lenis is off.

---

## 8. Performance plan and budgets

**Load order**

| Phase | What | Size budget |
|---|---|---|
| HTML | full SSR markup, inline motion script (~150 B), critical CSS (Tailwind, one file) | — |
| Preload | 2 latin variable fonts (next/font preloads), hero AVIF/WebP via `<picture>` with `fetchPriority="high"` + `sizes="(min-width: 900px) 500px, 100vw"` | hero ≤ 120 KB |
| First-load JS (HTML `<script src>`) | framework (measured 170.8 KB gz) + client islands (target ≤ 25 KB) | **≤ 200 KB gz** (OQ-1) |
| After hydration, idle | `OverlayHost` (Radix + Motion + consoles/lightbox/sheet) — always; `SmoothScroll` (GSAP/ST/SplitText/Lenis) — motion on; `FxLayer` — fine pointer + motion on | **≤ 150 KB gz total** (libs measured 135.3) |
| After `load` + idle, tier ≥ medium | `CosmosCanvas` chunk (three + fiber + drei Environment/Lightformer/PerformanceMonitor + postprocessing on high) | measured 286.5 KB gz |
| Gallery near viewport, tier ≥ medium | `OrbitGallery` chunk (shares three/fiber with cosmos) | 3D total **≤ 380 KB gz** (gallery-only stack measured 237.0) |
| On click | `audio-analyser` | ≤ 5 KB |

**Chunk boundaries** (each is one `import()` call site): `MotionProvider.tsx` → `SmoothScroll`, `FxLayer`, `CosmosCanvas`; `ConsoleProvider.tsx` → `OverlayHost`; `GalleryStage.tsx` → `OrbitGallery`; `HearPhrase.tsx` → `audio-analyser`. Rules: no first-load file imports `gsap`, `lenis`, `motion/react`, `@radix-ui/*`, `three`, `@react-three/*`, `postprocessing`, `maath` (QA greps the first-load chunks for `ScrollTrigger`, `lenis`, `DismissableLayer`, `WebGLRenderer` in BUD). drei imported by named path only; never `StatsGl`.

**Other tactics**: animate only `transform`/`opacity`/`filter`; `will-change` set by GSAP only while tweening; every `<img>` has width/height; canvases `position:fixed/absolute`; below-the-fold images `loading="lazy" decoding="async"`; Bodoni and Instrument latin subset only; `ScrollTrigger.refresh()` after `document.fonts.ready` and hero `load`; scroll anchoring left on (absorbs DOM↔3D gallery height switch, R-6).

**Budgets to verify**: Lighthouse mobile Perf ≥ 80 (target 90), A11y ≥ 95, BP ≥ 95, SEO 100; desktop Perf ≥ 95; LCP ≤ 2.5s; CLS ≤ 0.05; TBT ≤ 250ms; first-load JS ≤ 200 KB; deferred ≤ 150 KB; 3D ≤ 380 KB; hero image ≤ 120 KB. Tools: LH (`lhci autorun`), BUD (`node scripts/bundle-report.mjs --check`).

---

## 9. Deployment plan

**Files (verbatim from §15, diffed by Q29)**: `.github/workflows/deploy.yml` (§15.2), `deploy/htaccess-root`, `deploy/htaccess-static` (§15.3), `scripts/prepare-deploy.mjs` (§15.4, with D-001 number). `.nvmrc` = `22`. `package.json` scripts = §4.5 verbatim plus nothing else (use `node scripts/bundle-report.mjs` directly). `.gitignore` already has `/out/ /.next/ /public/_img/ /qa/ /playwright-report/ /test-results/ /.lighthouseci/ next-env.d.ts`.

**Pipeline**: push `main` → `npm ci` → `npm run lint` → `npm run build` (prebuild runs `optimize-images.mjs`) → `npm run typecheck` → `node scripts/prepare-deploy.mjs` → commit `out/` to `deploy` (fast-forward, never force) → Hostinger Git pulls into `public_html`.

**Dry-run (Gate 4)**: QA creates a bare repo under `qa/` (gitignored), runs the publish step's shell logic against it twice (first run creates `deploy`, second with no change prints "Nothing changed"), and confirms `.htaccess` and `_next/static/.htaccess` are committed. This needs bash/git, which macOS has; it is a QA procedure, not an npm script.

**One-time Hostinger steps (README, §15.5)**:
1. Push to `main`; wait for "Build and publish to Hostinger" green in Actions (creates `deploy`).
2. hPanel → File Manager → `public_html`: back up, then empty it.
3. hPanel → Advanced → Git → Connect with GitHub → install the Hostinger GitHub App for this repo → Branch **`deploy`** → Directory default (`public_html`) → Deploy.
4. hPanel → Security → SSL: active, **Force HTTPS** on.
5. Edit `site.ts` `siteUrl` to the real domain; commit; it redeploys.
- Fallback for older hPanel: SSH repo URL + deploy key, branch `deploy`, blank directory, Auto Deployment webhook → GitHub Webhooks (push).
- Never edit `public_html` by hand; never push `deploy` by hand.

---

## 10. Risk register

| ID | Risk | L | I | Mitigation |
|---|---|---|---|---|
| R-1 | First-load JS > 200 KB (framework alone is 170.8 KB) | H | H | OQ-1 chunk boundaries; CSS `linear()` springs in first-load islands; BUD check every gate from M2; grep first-load chunks for forbidden libs |
| R-2 | GSAP reveal leaves content at opacity 0 (no-JS, reduced motion, late MotionLayer load) (pitfall 13) | M | Blocker | hidden state only via `gsap.set` inside SmoothScroll; skip elements already past trigger; Q13 + Q14 every gate from 2 |
| R-3 | Hydration mismatch from `window`/`localStorage`/`matchMedia`/date `min` during render (pitfall 3) | M | M | all reads in effects or `useSyncExternalStore` with server snapshot; Q2 console-error check |
| R-4 | Gallery photos washed out or stretched (pitfalls 7–8) | M | M | SRGB colour space, tonemapping/colorspace chunks, `NoToneMapping`, shader cover-fit; Q22 luminance; M-11 replacement drill (portrait image swapped into `gal-1.jpg`) |
| R-5 | WebGL context loss / weak GPU breaks layout or logs errors | M | M | ceiling `off`, ErrorBoundary, poster always underneath; Q20, Q21 |
| R-6 | CLS when the gallery switches DOM grid ↔ 3D shell, or nav/consoles shift layout | M | M | decide tier at hydration (user at top); fixed-height 3D shell; scroll anchoring on; Lighthouse CLS ≤ 0.05 |
| R-7 | Lenis vs Radix scroll lock vs native touch (pitfall 16); `uWarp` zero on touch because `syncTouch:false` | M | M | `lenis.stop/start`, `data-lenis-prevent`; compute warp velocity from `scrollY` delta when Lenis velocity is 0 |
| R-8 | CTA clicked before OverlayHost loads → opens WhatsApp instead of console; flaky tests | M | L | by design falls back to the working link; prefetch on idle + first intent; QA waits for `html[data-overlays="ready"]` |
| R-9 | Typography drift from legacy (fallback fonts, `next/font` hashing, wrong line-heights) | M | M | §5.4 table as CSS classes; Q7 with OQ-2 rule; `document.fonts.check()`; lone-word check at 320/360/390 |
| R-10 | Lockfile missing Linux natives → CI "Cannot find native binding" (pitfall 28) | L (verified present in scratch lock) | Blocker | Q29 lockfile check after every install; `optionalDependencies` pin fallback |
| R-11 | Verbatim workflow uses Node 20-based `actions/*@v4` (deprecation) | M | M | keep verbatim; watch first run; bump to `@v5` via DECISIONS row if it fails (OQ-18) |
| R-12 | Hostinger first deploy fails (non-empty `public_html`) or Force HTTPS loop | M | H | README steps 2 and 4; no redirect rules in `.htaccess` (pitfall 25) |
| R-13 | Placeholder list mismatch README ↔ page (Q27 Major) | M | M | `derive.placeholderList(site)` generates the README checklist block in M4; Q27 counts from DOM text (OQ-11) |
| R-14 | Hero LCP delayed on mobile by the CSS H1 intro (H1 may be LCP at 390px; portrait below fold) | M | M | intro ≤ 1.4s, H1 words start at opacity 0 for ≤ 900ms only; portrait never hidden; measure LCP element in LH; if LCP > 2.5s shorten H1 stagger (log decision) |

(14 listed; the top 12 by L×I are R-1, R-2, R-10, R-12, R-3, R-4, R-5, R-6, R-7, R-9, R-11, R-14.)

---

## 11. Milestones and ordered tasks

Every handoff: `npm run lint && npm run build && npm run typecheck && node scripts/prepare-deploy.mjs` green; Playwright screenshots at 390 and 1440 self-reviewed; `docs/HANDOFF-Mx.md` written.

### M1 — Scaffold, tokens, typography, all content static (Gate 1)

| Task | Work | Acceptance criteria |
|---|---|---|
| T1.1 | Dependencies per §3 exact; remove `@tailwindcss/turbopack`; `postcss.config.mjs`; `next.config.ts` §4.5 verbatim; `package.json` scripts §4.5 verbatim | plain `npm install` exit 0, no peer warnings; lockfile has 4 Linux natives; `next.config.ts` byte-identical to §4.5 |
| T1.2 | `scripts/optimize-images.mjs` (§14) + `src/lib/images.ts` (`getImage`, `pickVariant`) | `public/_img/manifest.json` + avif/webp variants + `og.jpg` 1200×630; second run skips (logs "0 updated"); empty folder exits 0 |
| T1.3 | `globals.css`: §5.3 tokens on `:root`, `@theme inline`, §5.4 type classes, §5.5 layout utilities, focus ring, `prefers-contrast`/`prefers-reduced-transparency` rules, `html[data-tier]` surfaces (OQ-17) | no colours outside §5.3; Tailwind utilities compile |
| T1.4 | `layout.tsx`: fonts (§5.4 exact), `lang="en-NG"`, `suppressHydrationWarning`, inline `wale-motion` script, metadata + `viewport` (§13), `CosmosPoster`, SkipLink | fonts self-hosted in `out/_next/static/media`; no request to `fonts.googleapis.com` |
| T1.5 | `src/content/site.ts` (§6 verbatim + §4.1 keys) and `derive.ts` | every §6 string present once; ’ “ ” typographic; `tsc` passes |
| T1.6 | `src/lib/whatsapp.ts` (OQ-7, OQ-10) | Q28 strings exact |
| T1.7 | UI primitives: Button, Picture, Eyebrow, SectionHeading, RichText, Chip, HudFrame, Icon | Button heights 44/48/56/60; `wa.me` links have `target="_blank" rel="noopener"` |
| T1.8 | All sections + Nav + Footer + JsonLd + 404 as static server components, final layout and responsive grids, `data-reveal`/`data-fx` hooks in place but inert; DOM gallery; FAQ answers rendered | all §6 content in `out/index.html`; one `h1`; ordered headings; 320–2560 no overflow |
| T1.9 | `robots.ts`, `sitemap.ts`, `icon.svg` (paths only) | `out/robots.txt`, `out/sitemap.xml`, `out/icon.svg` exist |
| T1.10 | Widget and nav button as plain `wa.me` links (no JS yet); footer padding ≥ 104px | Q11 overlap check passes; Q12 passes |
| T1.11 | `deploy/htaccess-*`, `scripts/prepare-deploy.mjs` verbatim (needed for the handoff command chain) | `node scripts/prepare-deploy.mjs` exits 0 |

Gate 1 tests: CI, Q1–Q8, Q12, Q23, Q24 (page only), Q25, Q26, Q27, Q28, Q29 (files present so far), VIS (motion-off rows).

### M2 — Motion system, pop-ups, consoles, widget, sheet, DOM gallery + Lightbox (Gate 2)

| Task | Work | Acceptance criteria |
|---|---|---|
| T2.1 | `motion-preference.ts` store + `MotionToggle` (footer, sheet) + `MotionProvider` | toggle persists in `wale-motion`; no flash for returning off users; `html[data-motion]` set |
| T2.2 | `motion-tokens.ts` (spring specs, CSS `linear()` strings, press) | `ui/snap/flick/sheet/reveal/press` exported; used everywhere instead of literals |
| T2.3 | Hero CSS intro (§7.1) gated by media query + `data-motion` | total ≤ 1.4s; reduced motion → no intro |
| T2.4 | `SmoothScroll` (deferred): Lenis root (`lerp .1, smoothWheel, syncTouch:false, anchors.offset -80, autoRaf:false`), GSAP ticker, `lagSmoothing(0)`, ScrollTrigger update, refresh after fonts + hero load, all reveal/scrub beats of §5, SplitText (`autoSplit`, `aria:'auto'`), chapter tints → `cosmos-bus` | Q13, Q14, Q16 pass; no `lenis` class when motion off |
| T2.5 | `NavController` (hide/show, focus-within), `ScrollProgress` | nav visible while focused; Q25 |
| T2.6 | `ConsoleProvider`, `overlay-store`, `OverlayHost` (deferred) with `html[data-overlays="ready"]` | M-07: plain links before ready |
| T2.7 | BookingConsole + LessonsConsole + MessagePreview + ChipGroup + BottomSheet | Q9, Q10 |
| T2.8 | WhatsAppWidget + ContactMenu disclosures | Q11; three options with booking/lessons/general templates |
| T2.9 | MobileSheet with drag-to-dismiss | Q17 |
| T2.10 | Accordion (FAQ) | Q18 |
| T2.11 | DomGallery tiles as buttons + Lightbox (FLIP from rect, swipe, drag-down, video) | Lightbox opens/closes with focus return; Q24 with Lightbox open |
| T2.12 | `FxLayer` (deferred): tilt, sheen, spotlight, magnetic, CursorFollower | off when `pointer: coarse` or motion off; native cursor visible |
| T2.13 | `scripts/bundle-report.mjs` | first-load ≤ 200 KB, deferred ≤ 150 KB (BUD) |

Gate 2 tests: all Gate 1 + Q9–Q11, Q13–Q18, Q24 (each pop-up), BUD (first-load + deferred), VIS pop-up rows.

### M3 — 3D: Cosmos, Orbit Gallery, tiers, fallbacks (Gate 3)

| Task | Work | Acceptance criteria |
|---|---|---|
| T3.1 | `quality-tier.ts` (`detectTier`, ceiling, override) + `useQualityTier` + `html[data-tier]` | `?tier=off|low|medium|high` honoured, never persisted |
| T3.2 | `CosmosCanvas`/`Cosmos`/`BrassDust` + `shaders/dust.ts` + uniforms bus | fade-in 1.2s; no black flash; paused when hidden |
| T3.3 | `SoundRibbon` + Lightformer environment + `CosmosEffects` (high only) | zero network requests to non-origin hosts |
| T3.4 | `OrbitGallery`, `GalleryPlane`, `BrassCore`, `OrbitLines` + `shaders/gallery.ts` | cover-fit; Q22 < 6% |
| T3.5 | Gallery input: drag, momentum projection, snap/flick, tap→Lightbox FLIP from projected rect, horizontal wheel only, keyboard list + live region, prev/next | Q19 |
| T3.6 | PerformanceMonitor step-down, context-loss handling, ErrorBoundary, dispose on unmount | Q20, Q21; no console errors |
| T3.7 | Warp bursts from Paths, chapter tints, `uDim` from Lightbox, audio wiring (`HearPhrase` + analyser, hidden while `audioSample` null) | no audio code in any chunk loaded when `audioSample` is null |
| T3.8 | Bundle report into `HANDOFF-M3.md` | 3D ≤ 380 KB gz |

Gate 3 tests: all earlier + Q19–Q22, Q2/Q3 at `?tier=high`, BUD (3D), VIS gallery rows, LH smoke (not gating).

### M4 — Deploy pipeline, image polish, SEO, README (Gate 4)

| Task | Work | Acceptance criteria |
|---|---|---|
| T4.1 | `.github/workflows/deploy.yml` verbatim | Q29 diff clean |
| T4.2 | Image pipeline polish: hero AVIF ≤ 120 KB at displayed size, `og.jpg` per §14 | BUD image check; `out/_img/og.jpg` exists |
| T4.3 | SEO: metadata, OG/Twitter, JSON-LD `@graph` (Person + 2 Service, no ratings), canonical | Q26 |
| T4.4 | README for Nonso/Wale (§15.6) incl. generated "Before launch: confirm with Wale" list from `derive.placeholderList` + CONFIRM flags | Q27 count match |
| T4.5 | Final perf pass against §12 | LH thresholds met |
| T4.6 | Lockfile Linux-native check after final install | Q29 |

Gate 4 tests: FULL regression Q1–Q29, LH (mobile + desktop, 3 runs), BUD, VIS full matrix, deploy dry-run, M-11 replacement drill, CI from clean clone.

---

## 12. Traceability matrix (M-ID → tasks → tests)

| M-ID | Tasks | Tests |
|---|---|---|
| M-01 Typography exact, no other faces | T1.3, T1.4, T1.7, T1.8 | Q7 (OQ-2 rule), VIS (no fallback fonts, lone words 320/360/390), grep CSS/JS for `font-family` other than the two |
| M-02 Real DOM text, SSR | T1.5, T1.8 | Q1, Q5 (reads `out/index.html` too), Q12 (no-JS), Q14 |
| M-03 Static export only | T1.1, T1.9, T1.11 | CI, Q4, Q29 (`next.config.ts` verbatim) |
| M-04 Deploy via Actions → `deploy` branch | T1.11, T4.1, T4.6 | Q29, deploy dry-run (Gate 4), `git ls-files` shows no `out/ .next/ node_modules/` |
| M-05 `wa.me` format, templates | T1.6, T1.7, T2.7, T2.8 | Q8, Q9, Q10, Q28 |
| M-06 Floating widget with 3 options | T1.10, T2.8 | Q11, Q12, Q24 (widget open) |
| M-07 CTAs work without JS | T1.7, T1.10, T2.6 | Q12, Q9 (enhanced path) |
| M-08 Both chapters, copy verbatim | T1.5, T1.8 | Q5, Q6 |
| M-09 No invented facts | T1.5, T4.3, T4.4 | Q27, Q26 (no AggregateRating/Review), Q5, Q6 (null → hidden/fallback) |
| M-10 One content file | T1.5, T1.8 | Q5 + Q6 import `site.ts`; QA grep: no string literals of §6 copy in `src/components/**` |
| M-11 Replace photo by same name; never stretched | T1.2, T1.7, T3.4, T4.2 | Q22, M-11 replacement drill (swap `gal-1.jpg` for a 3:4 and `occ-weddings.jpg` for a 16:9, rebuild, screenshot DOM + 3D + Lightbox) |
| M-12 WCAG 2.2 AA | T1.8, T2.5–T2.11, T3.5 | Q9 (focus return), Q11, Q17, Q18, Q24, Q25, LH a11y ≥ 95 |
| M-13 Reduced motion/transparency/contrast + toggle | T2.1–T2.4, T2.12, T3.1 | Q14, Q15, VIS (`prefers-contrast`, `prefers-reduced-transparency` emulation screenshots) |
| M-14 Graceful fallbacks | T3.1, T3.6, T1.8 (poster/DOM grid) | Q14, Q20, Q21 |
| M-15 Budgets; LCP independent of JS/3D | T2.13, T3.8, T4.2, T4.5 | LH, BUD, Q12 (hero renders with JS off) |
| M-16 No runtime third-party requests | T1.4, T3.3 | Q3 extended: every request URL is same-origin during a full scroll at `?tier=high`; LH network log |
| M-17 No emoji/lorem/AI tropes | T1.3, T1.8 | VIS review; grep built HTML for emoji ranges (`\p{Extended_Pictographic}`) and `lorem` |
| M-18 320–2560, no overflow, widget overlap | T1.8, T1.10 | Q23, Q11 |
| M-19 lint/build/typecheck/prepare-deploy pass, cross-platform | T1.1, T1.11, all tasks | CI (clean clone), `package.json` script review (no `rm`, `cp`, bash), OQ-15 typecheck-before-build check |
| M-20 QA gate 0 Blocker/Major | all | `docs/QA-REPORT.md` Gate 4 summary |

Reverse coverage (every §16 test has an owner task): Q1 T1.8 · Q2 T2.x/T3.6 · Q3 T1.8/T3.3 · Q4 T1.9/T1.11 · Q5 T1.5/T1.8 · Q6 T1.5 · Q7 T1.3/T1.4 · Q8 T1.6/T1.7 · Q9 T2.7 · Q10 T2.7 · Q11 T1.10/T2.8 · Q12 T1.7/T1.10 · Q13 T2.4 · Q14 T2.1/T2.4/T3.1 · Q15 T2.1/T3.1 · Q16 T2.4 · Q17 T2.9 · Q18 T2.10 · Q19 T3.5 · Q20 T3.1/T3.6 · Q21 T3.6 · Q22 T3.4 · Q23 T1.8 · Q24 T1.8/T2.6–T2.11 · Q25 T1.8/T2.5 · Q26 T1.9/T4.3 · Q27 T1.5/T4.4 · Q28 T1.6 · Q29 T1.1/T1.11/T4.1/T4.6.

**QA spec layout** (one file per §16.2 group): `tests/smoke.spec.ts` (Q1–Q4), `tests/content.spec.ts` (Q5), `tests/unit/derive.spec.ts` (Q6), `tests/typography.spec.ts` (Q7), `tests/whatsapp.spec.ts` (Q8–Q12), `tests/motion.spec.ts` (Q13–Q18), `tests/three.spec.ts` (Q19–Q22), `tests/layout-a11y.spec.ts` (Q23–Q25), `tests/seo.spec.ts` (Q26), `tests/placeholders.spec.ts` (Q27), `tests/unit/whatsapp.spec.ts` (Q28), `tests/ci.spec.ts` (Q29), `tests/budget.spec.ts` (BUD). Projects: `desktop-chromium` 1440×900 and `mobile-chromium` Pixel 7 with `channel:'chrome'`; `no-webgl` (Chrome args `--disable-webgl --disable-3d-apis`) for Q20; `unit` (no browser) for Q6/Q28; `webkit-iphone` skipped (D-002).
