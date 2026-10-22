# HANDOFF — M1: Scaffold, tokens, typography, all content static

Designer → QA, Gate 1. Branch `rebuild`, uncommitted (the Orchestrator commits after the gate).

## What was built (PLAN §11 M1, T1.1–T1.11)

| Task | Result |
|---|---|
| T1.1 | Exact-pinned deps per PLAN §3 (plain `npm install`, no `--force`/`--legacy-peer-deps`). `@tailwindcss/turbopack` removed; `postcss.config.mjs` added (D-004). `next.config.ts` is §4.5 verbatim. `package.json` scripts are §4.5 verbatim. The lockfile contains all four Linux natives (`@img/sharp-linux-x64`, `@tailwindcss/oxide-linux-x64-gnu`, `lightningcss-linux-x64-gnu`, `@next/swc-linux-x64-gnu`). |
| T1.2 | `scripts/optimize-images.mjs` writes AVIF/WebP at 480/800/1200/1600 (≤ source width), `og.jpg` 1200×630 and `manifest.json` to `public/_img/`. The second run prints `0 files updated, 49 up to date`. `src/lib/images.ts` has `getImage()` and `pickVariant()` (fs read in try/catch, falls back to `/images/<name>`). |
| T1.3 | `globals.css` defines the §5.3 tokens on `:root`, `@theme inline` (fonts + colours), the §5.4 type classes (`.t-h1`, `.t-h2`, `.t-h2-final`, `.t-card-title`, `.t-h3`, `.t-num-sm/lg`, `.t-stat-*`, `.t-lead`, `.t-body`, `.t-emph`, `.t-card-body`, `.t-pull`, `.t-quote`, `.t-caption`, `.t-faq-q`, chip, button, nav link, wordmark), §5.5 layout, the focus ring, and the `prefers-contrast: more` and `prefers-reduced-transparency` rules. Surfaces follow OQ-17: solid `--ink-2`/94% by default; blur only under `html[data-tier="high"]`. |
| T1.4 | `layout.tsx`: Bodoni Moda (normal + italic, `opsz` axis) and Instrument Sans via `next/font/google` as `--font-bodoni` / `--font-instrument`; `lang="en-NG"`; `suppressHydrationWarning`; the inline `wale-motion` script; metadata + `viewport.themeColor` (§13); SkipLink, CosmosPoster, WhatsAppWidget. The 10 `.woff2` files are self-hosted in `out/_next/static/media`. |
| T1.5 | `src/content/site.ts` holds every §6 string (typographic ’ “ ”, `*emphasis*` markup), the §6.2 shape plus the PLAN §4.1 keys and `messages` (OQ-7). `src/content/derive.ts` has the pure flag helpers: `pathsCards`, `coverageParagraphs`, `lessonsLead` (throws per OQ-9), `lessonsMicrocopy`, `whoCards`, `enabledFormats`, `lessonFormats`, `formatPriceLine`, `faqItems`, `lessonsConsoleQuestions`, `galleryItems`, `isPlayableVideo`, `videoAction` (OQ-13), `footerName`, `instagramLink`, `galleryCounter`, `placeholderList`. |
| T1.6 | `src/lib/whatsapp.ts`: `waLink`, `bookingMessage`, `lessonsMessage`, `generalMessage`, `parseISODate` (local date, never UTC), `formatDate` (en-NG), `cleanText`, `defaultLinks`. Default booking date line is blank (OQ-10). |
| T1.7 | UI: `Button` (always `<a href>`, sizes S/M/L/XL = 44/48/56/60px, `target="_blank" rel="noopener"` on external links, `data-console`), `Picture`, `Eyebrow`, `SectionHeading`, `RichText`, `Chip`, `HudFrame`, `Magnetic`, `Icon` (stroke SVGs + simple-icons WhatsApp/Instagram). |
| T1.8 | Every section is a static server component in final layout: Nav, Hero, Paths, 3 chapter markers, WhyLive, Occasions, PullQuote, BookingSteps, Hosts, Coverage (+ Constellation), LessonsIntro, LessonsPAS, LessonsWho, LessonsPath, LessonsFormats, Students, Gallery (DomGallery fallback layout), FAQ (answers rendered), FinalCta, Footer, JsonLd, 404. `data-reveal`/`data-fx`/`data-scrub`/`data-chapter-tint` hooks are in place but inert. |
| T1.9 | `robots.ts`, `sitemap.ts` (`force-static`), `icon.svg` (brass italic W drawn as paths on a `#0A090B` rounded square). |
| T1.10 | The widget and nav “Message Wale” are plain `wa.me` links (general template). The footer bottom padding is `120px + safe-area`. |
| T1.11 | `deploy/htaccess-root`, `deploy/htaccess-static` and `scripts/prepare-deploy.mjs` were extracted byte-for-byte from BUILD-PROMPT.md §15.3/§15.4 (with the D-001 number). |

**Page order:** Nav → Hero `#top` → Paths `#paths` → `#performances` [marker I, Why `#why`, Occasions `#occasions`, Pull quote, Booking steps `#booking-steps`, Hosts `#hosts`] → Coverage `#coverage` → `#lessons` [marker II, `#lessons-intro`, `#lessons-why`, `#lessons-who`, `#lessons-path`, `#lessons-formats`, `#students`] → `#gallery` [marker III, `#watch`] → FAQ `#faq` → Final CTA `#contact` → Footer. See D-010 for the chapter wrappers.

**No-JS CTA mapping (Q12):** hero primary, occasions CTA and final CTA 1 → booking template; hero secondary, lessons-intro CTA, formats CTA and final CTA 2 → lessons template; nav “Message Wale”, the widget and the footer WhatsApp link → general template. Every link has `target="_blank" rel="noopener"`. `data-console` is `booking` / `lessons` / `contact` (nav) for M2.

## Results of the handoff command chain (run on this machine)

```
npm run lint                     → exit 0, no output (0 errors, 0 warnings)
npm run build                    → prebuild: "optimize-images: 11 images, 0 files updated, 49 up to date"
                                   ✓ Compiled successfully; routes ○ / ○ /_not-found ○ /icon.svg ○ /robots.txt ○ /sitemap.xml
npm run typecheck                → exit 0
node scripts/prepare-deploy.mjs  → "prepare-deploy: out/ is ready for Hostinger (272 [placeholder] strings still on the page)."
```

The 272 is the verbatim script's raw-HTML regex count. It also matches RSC payload arrays and duplicates, and it is informational only (OQ-11).

## How to verify

1. `npm run build && node scripts/prepare-deploy.mjs`, then `npx serve out -l 4173`.
2. Open `/` at 320–2560px. `scrollWidth - innerWidth` is 0 at 320, 360, 390, 768, 1024, 1440, 1920 and 2560 (Designer measurement).
3. At 320, 390 and 1440, when scrolled to the bottom, no footer text or link intersects the widget's box (Designer measurement). No standalone `a`/`button` is under 44px tall. The only small target is the inline `tel:` link inside the call line, which uses the WCAG inline exception and is padded to 40px.
4. `document.fonts.check()` is true for both families. Computed families on `h1, h2, p, a, span` are only “Bodoni Moda” and “Instrument Sans”.
5. With JS off, every CTA, the nav button and the widget are `wa.me` links. Menu (< 860px) opens the `:target` panel.
6. `/does-not-exist` serves the branded `404.html` (eyebrow, H1, body, Back to the home page, widget).

## Self-review (screenshots, Designer only, not QA evidence)

These are throwaway shots in the scratchpad, motion-reduced. I looked at the 390 and 1440 sections against §5/§7 and the legacy page: the type scale, the brass italic emphasis, the HUD ticks on the hero, the lessons image and the path cards, the dashed placeholder cards and pull quote, the steps connector, the constellation labels, the gallery fallback layout, the footer and widget spacing, and the 404. Element crops of tall sections show the fixed nav/widget mid-image; that is a Playwright stitching artifact.

## Known gaps / for QA attention

- **H1 lone word at 320–360px** (“Live” alone on line 1). This can't be prevented at the §5.4 minimum size; I proposed a fix in **D-009** and kept the spec size until it is approved. At ≥ 390px the H1 is “Live saxophone, / delivered to / your door.”
- **Typography vs legacy (Q7):** the values match §5.4. As in OQ-2, card title / H3 / FAQ question line-heights follow §5.4 (1.15 / 1.3 / 1.4), not legacy's inherited 1.5. Card body text is 15px/1.6 everywhere (legacy features used 1.65, inside the §5.4 1.6–1.65 range). FAQ answers are 16px/1.7 like legacy.
- **Hero copy differs from legacy by design** (new §6 copy: eyebrow, lead, second CTA, third stat).
- **M2 scope not built:** consoles, contact menu and widget panel, Mobile Sheet (M1 uses a CSS `:target` panel, D-011), FAQ accordion (D-012), Motion toggle in the footer, hero CSS intro, scroll progress, Lightbox, live dot breathe, constellation chip↔node hover, all reveals and scrubs. The 3D (M3), the deploy workflow and README (M4) are not built either.
- The `#lessons-path` heading is `position: sticky` (top 96px) at ≥ 900px. That is layout, not animation.
- Coverage H2 at 1440: balance puts “— anywhere.” at the start of line 3. The copy is untouched.
- `siteUrl` is still `https://YOUR-DOMAIN.com` (CONFIRM), so canonical, OG, robots and sitemap use it.

## Decisions added

D-007 … D-016 in `docs/DECISIONS.md`: hero grid, rails not in poster, H1 lone-word **proposal** (open), chapter anchor wrappers, no-JS menu, static FAQ structure, widget glyph colour, gallery caption chips, `bodyNoYoung` transcription, og.jpg crop.

---

## Fix round 1 (QA Gate 1 run 1: 4 Majors, 6 Minors)

| Issue | Fix | Where |
|---|---|---|
| **G1-01** Major: H1 broke into 4 lines at ≥ 1536px | The hero portrait column is now `minmax(0, 400px)` (was 440). The copy column is ≥ 664px at the 5.6rem H1 cap, so “Live saxophone,” (~625px) fits. The §5.4 clamp is unchanged. D-007 was rewritten to describe this. | `globals.css` `.hero__inner` (≥ 900px) |
| **G1-02** Major: Q7 line-heights | `.btn` and `.chip` line-height 1.5, which matches legacy (24px / 21px). | `globals.css` `.btn`, `.chip` |
| **G1-03** Major: targets < 44px | `.nav__link` gets `min-width: 44px` (centred). `.final__tel` gets `padding-block: 12px; min-height: 44px` (46px tall). | `globals.css` |
| **G1-04** Major: preventable lone words | No-break spaces (U+00A0) in `site.ts`: `saxophone from someone who` and `Learning it`. I ran the lone-word test over every H1/H2 at 320/360/390: no preventable lone words remain (the H1 at ≤ 360 is accepted by D-017). D-018. | `src/content/site.ts` |
| **G1-05** Minor: pull-quote section without a label | The wrapper is now a `<div>`: it has no heading and the spec gives it none, so it isn't a labelled region. I chose this over an invented `aria-label` string. | `PullQuote.tsx` |
| **G1-06** Minor: coverage H2 line starting with “—” | `Plays — and teaches — anywhere.`. From 360px up: “Based in Ajah. / Plays — and / teaches — anywhere.”. **At 320px it still ends “— anywhere.”**: “teaches — anywhere.” is 310px against a 288px column, so the only alternative is a lone “anywhere.” (a Major). See D-018. | `site.ts` |
| **G1-08** Minor: connector not brass | `.steps__connector` is solid `--brass` on phones and desktop. | `globals.css` |
| G1-07 Minor: portrait backdrop box | **Deferred to M2**, alongside the portrait entrance, sheen and tilt work. | — |
| G1-09 Minor: “Wherever there’s / something / to celebrate.” | **Deferred / no change**: QA measured it as not preventable at the §5.4 size. A copy tweak is Nonso's call. | — |
| G1-10 Minor (info): npm audit advisories | **Deferred to M4** (dev tooling only; nothing ships in `out/`). | — |

### Command chain after the fixes

```
npm run lint                     → exit 0, no output
npm run build                    → ✓ Compiled successfully (same 5 static routes)
npm run typecheck                → exit 0
node scripts/prepare-deploy.mjs  → "out/ is ready for Hostinger (272 [placeholder] strings still on the page)."
```

### QA suite (`QA_GATE=1 npx playwright test`, out/ on 4173, legacy/ on 4174; both servers stopped afterwards)

- **Final full run: 128 passed, 0 failed, 71 skipped** (the skips are later-gate tests, as in QA's run).
- One earlier full run had 1 failure: `smoke.spec.ts › Q3` (desktop) “no failed requests”. Three isolated `smoke.spec.ts` runs and the next full run all passed, so it looks flaky under load (probably an aborted lazy-image request while scrolling). Worth a look by QA; I did not touch the test.
- `typography.spec.ts` (Q7, the §5.4 table, lone words at 320/360/390, D-007 at 900–2560), `content.spec.ts` (Q5 including section labels) and `layout-a11y.spec.ts` (44×44, axe, keyboard) are all green.

Self-review screenshots: `/private/tmp/claude-501/-Users-mac-Documents-wale-sax/37d673f0-d88c-416b-87e3-ff8535d80567/scratchpad/designer/shots/r1-fold-1920.png` (H1 in three lines, 400px portrait) and `r1-coverage-390.png` (coverage H2 without a dash-led line).
