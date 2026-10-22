# QA report — Gate 1 (M1: scaffold, tokens, typography, all content static)

| | |
|---|---|
| Gate | **QA Gate 1, run 2** (after Designer fix round 1; §2.2: content parity, typography parity, links, a11y basics, build/export) |
| Date | 2026-10-22 |
| Commit | `9636001` on `rebuild` + uncommitted M1 working tree incl. fix round 1 (`docs/HANDOFF-M1.md` "Fix round 1", D-007 rev., D-018, D-019) |
| Tester | QA Tester (independent) |
| Result | **GATE PASSED** — 0 Blockers, 0 Majors, 5 open Minors (roll forward) |

## How this was run

1. Clean CI-equivalent build (log: `qa/logs/gate1-run2-ci.log`): deleted `node_modules`, `.next`, `out` with the §16.1 Node one-liner → `npm ci` (exit 0) → `npm run lint` (0 errors/warnings) → `npm run build` (5 static routes) → `npm run typecheck` (exit 0) → `node scripts/prepare-deploy.mjs` ("out/ is ready for Hostinger (272 [placeholder] strings…)", informational per OQ-11). Lint and typecheck re-run after the QA spec changes: clean.
2. `out/` on `npx serve out -l 4173`, `legacy/` on `npx serve legacy -l 4174`; Playwright 1.64.1 on installed Chrome 150 (`channel: 'chrome'`, D-002). **webkit-iphone: SKIPPED** (WebKit not installable on macOS 12, D-002).
3. Command: `QA_GATE=1 npx playwright test`, run **twice** in full:
   - run A: **130 passed, 0 failed, 71 skipped** (`qa/results-run2-1.json`, `qa/logs/gate1-run2-pw1.log`)
   - run B: **130 passed, 0 failed, 71 skipped** (`qa/results-run2-2.json`, `qa/logs/gate1-run2-pw2.log`)
   - plus Q3 stress: `npx playwright test tests/smoke.spec.ts -g Q3 --repeat-each=8 --workers=4` → 16/16 passed.
   Skips = later-gate tests, the README comparison (M4), and viewport-independent tests that run in one project only.
4. Fresh screenshot matrix (motion off: 360×800, 390×844, 768×1024, 1440×900, 1920×1080, + 404 at 390/1440) in `qa/screenshots/gate1/`, plus element shots `steps-390.png`, `steps-1440.png` (@2x) and `coverage-h2-320.png`. Reviewed by eye.

### Test changes in this run (QA only; no assertion weakened)
- **Q3 (`smoke.spec.ts`) — flake investigation.** The Designer saw one desktop failure. Not reproduced: 0 failures and **0 aborted requests** in 2 full runs + 16 stressed Q3 runs. The test now separates `requestfailed` with `net::ERR_ABORTED` (a request the browser itself cancels, e.g. a lazy image dropped while scrolling fast or at teardown; recorded as an annotation) from real failures (any 4xx/5xx response, and every other network error, still fail the test). To make sure nothing is lost by that distinction, Q3 **adds** a stronger check: after the scroll every `<img>` on the page must be loaded (`complete && naturalWidth > 0`). If the Designer's failure was a 4xx/5xx it would still fail; it did not recur.
- **New `content.spec.ts › Q5/D-018`**: the headings carrying no-break spaces are compared, NBSP read as a space, with the §6 text typed verbatim from BUILD-PROMPT.md, and must contain no zero-width/soft-hyphen characters. The existing Q5 normalises all whitespace, so this guards D-018 explicitly. PASS.

## Fix-round verification

| Issue (run 1) | Verdict | Evidence |
|---|---|---|
| G1-01 Major — H1 4 lines at ≥ 1536px | **Fixed** | `typography.spec.ts › D-007` passes at 900/1024/1280/1366/1440/1536/1600/1920/2560: always `Live saxophone, / delivered to / your door.`. `full-1920x1080-part00.png`, `full-1440x900-part00.png`. §5.4 size unchanged (type table passes). |
| G1-02 Major — Q7 line-heights | **Fixed** | Q7 passes at 390 and 1440 (button 24px, chip 21px = legacy). |
| G1-03 Major — targets < 44px | **Fixed** | `M-12: interactive targets ≥ 44×44` passes desktop + mobile (nav links min-width 44, tel link ≥ 44 tall). |
| G1-04 Major — preventable lone words at 320 | **Fixed** | Lone-word tests pass at 320/360/390. Q5 (JS on/off) and the new Q5/D-018 test pass: no word of §6 changed. Remaining unpreventable cases (accepted): H1 "Live" ≤ 360 (D-017), "Wherever there’s / something / to celebrate.", FAQ "Before you / message." at 320. |
| G1-05 Minor — pull-quote section unlabelled | **Fixed / accepted** | Wrapper is now a `<div>` around `<figure><blockquote>…<figcaption>`. §11 requires `aria-labelledby` on *sections*; §6.6 gives the pull quote no heading, so it is correctly not a landmark/region and the figure/blockquote/figcaption semantics carry it. Meets §11. axe clean. |
| G1-06 Minor — dash-led coverage line | **Fixed ≥ 360px; 320px accepted** | 390/1440 now `Plays — and / teaches — anywhere.` (`full-390x844-part07.png`, `full-1440x900-part04.png`). At 320px: `Based in / Ajah. Plays — / and teaches / — anywhere.` (`coverage-h2-320.png`). Measured alternative is a lone "anywhere." (a §5.4 failure), so the dash-led last line at 320 is the lesser evil (D-018). Kept open as Minor G1-06b for Nonso's call. |
| G1-07 Minor — portrait backdrop box | Open (deferred to M2 by Designer) | unchanged |
| G1-08 Minor — connector not brass | **Fixed** | computed `background-color: rgb(212, 166, 74)` at 390 (vertical) and 1440 (horizontal); `steps-1440.png` (@2x) clearly brass. At 1× full-page scale the 1px line anti-aliases toward grey; not a defect. |
| G1-09 Minor — "something" alone | Open (not preventable; Nonso's call) | |
| G1-10 Minor (info) — npm audit | Open (deferred to M4); now 21 advisories (2 low, 1 moderate, 18 high), dev tooling only | |

## M-IDs

| M-ID | Status | Evidence |
|---|---|---|
| M-01 Typography exact | PASS | Q7 at 390/1440 (OQ-2 rule for card title); §5.4 type table (31 roles) at 390/1440; fonts.check() normal + italic Bodoni and Instrument; no other typeface on `/` or 404; lone-word rule at 320/360/390; D-007 H1 900–2560. |
| M-02 Real DOM text, SSR | PASS | Q5 with JS off and on. |
| M-03 Static export only | PASS | CI chain; `next.config.ts` = §4.5; no forbidden features in `src/`; Q4. |
| M-04 Deploy via Actions → `deploy` | Pending (Gate 4) | Partial: `out/ .next/ node_modules/ public/_img/` untracked and ignored; htaccess files + `prepare-deploy.mjs` verbatim. Workflow is M4. |
| M-05 `wa.me` format + templates | PASS (Gate 1 scope) | Q8 (`/` and 404), Q28 incl. TZ west of UTC. Consoles: Gate 2. |
| M-06 Floating widget, 3 options | Pending (Gate 2) | Static part PASS (Q11 at 320/390/1440, no footer overlap). Panel is M2. |
| M-07 CTAs work without JS | PASS (Gate 1 scope) | Q12 (all CTAs, nav button, widget; no-JS Menu panel). |
| M-08 Both chapters, copy verbatim | PASS | Q5, Q5/D-018, Q6 (48 flag combinations + extras). |
| M-09 No invented facts | PASS (Gate 1 scope) | Q27 provenance (all 22 placeholders from `site.ts`), Q26 no ratings. README list: Gate 4. |
| M-10 One content file | PASS | Q5/Q6/Q27 driven by `site.ts`. |
| M-11 Replace by name, never stretched | Pending (Gate 3/4) | DOM images cover-fit in screenshots. |
| M-12 WCAG 2.2 AA | PASS (Gate 1 scope) | axe 0 serious/critical on `/` and 404 (desktop + mobile); Q25 keyboard; 44×44 targets; one h1, ordered headings, landmarks, `lang="en-NG"`. Pop-ups: Gate 2. |
| M-13 Reduced motion / toggle | Pending (Gate 2) | |
| M-14 Fallbacks | Pending (Gate 3) | Poster + DOM gallery render. |
| M-15 Budgets / LCP | Pending (Gate 4) | Hero portrait loaded, opacity 1, `fetchpriority="high"` with JS off (Q12). |
| M-16 No third-party requests | PASS (Gate 1 scope) | Q3 both viewports; fonts self-hosted. |
| M-17 No emoji / lorem / AI tropes | PASS | visual review; built HTML: no emoji (only ©), no "lorem". |
| M-18 320–2560, no overflow | PASS | Q23 (9 widths, `/` and 404), Q11. |
| M-19 lint/build/typecheck/prepare-deploy | PASS | clean `npm ci` chain; scripts §4.5 verbatim, cross-platform; exact pins, TS 5.9.3, ESLint 9.39.5. |
| M-20 Gate with 0 Blocker/Major | PASS for Gate 1 | 0 Blockers, 0 Majors. |

## Tests §16 (Q1–Q29)

| Test | Status | Notes |
|---|---|---|
| CI (§16.1) | PASS | `qa/logs/gate1-run2-ci.log` |
| Q1 | PASS | desktop + mobile |
| Q2 | PASS | no console/page errors; no allowances |
| Q3 | PASS (×2 full runs + 16 stress runs) | aborted-vs-failed split documented above; all images loaded |
| Q4 | PASS | files + branded 404 (status 404) |
| Q5 | PASS | JS on/off, headings + `<em>`, CTAs, alts, outline, section labels, D-018 word check |
| Q6 | PASS | |
| Q7 | PASS | 390 + 1440 |
| Q8 | PASS | |
| Q9, Q10 | SKIPPED — not in Gate 1 scope (Gate 2) | |
| Q11 | PASS (static part) | panel/Esc: SKIPPED — Gate 2 |
| Q12 | PASS | |
| Q13–Q18 | SKIPPED — not in Gate 1 scope (Gate 2) | Q13/Q14/Q16 written; enable with `QA_GATE=2` |
| Q19–Q22 | SKIPPED — not in Gate 1 scope (Gate 3) | |
| Q23 | PASS | |
| Q24 | PASS (page + 404) | with pop-ups open: SKIPPED — Gate 2 |
| Q25 | PASS | |
| Q26 | PASS | (Next lower-cases the placeholder `siteUrl` host in canonical/OG; harmless once the real domain is set) |
| Q27 | PASS (listing, 31 total / 22 unique, `qa/placeholders-gate1.json`) / SKIPPED (README comparison — M4) | |
| Q28 | PASS | |
| Q29 | PASS (files present so far) | workflow diff: SKIPPED — Gate 4 |
| BUD | SKIPPED — Gate 2 | |
| LH | SKIPPED — Gate 4 | |
| VIS (motion-off row) | Done, reviewed | |

### Q27 placeholder list (rendered DOM text)

`[00]` ×2, `[0]` ×1 · pull quote `[A client’s words …paste them here.]` · `[Client name]` ×4 · `[Occasion]` · `[Area]` · three host quotes · `[Wedding · Lekki]` · `[Birthday · Ikoyi]` · `[Corporate dinner · Victoria Island]` · three student quotes · `[Adult beginner · Lekki]` · `[Parent name]` · `[Parent of a student · Ajah]` · `[Church instrumentalist · Sangotedo]` · `[Student name]` ×2 · `[@handle]` ×2 · `[Event, area]` ×4. Full strings in `qa/placeholders-gate1.json`.

## Open issues (all Minor, roll forward)

- **G1-06b — Minor — coverage H2 at 320px ends on a dash-led line** `— anywhere.` (`coverage-h2-320.png`). Unavoidable at the §5.4 size without a lone word (D-018). Nonso's call on copy.
- **G1-07 — Minor — hero portrait backdrop reads as a soft grey box** (`full-1440x900-part00.png`, `full-768x1024-part00.png`). Deferred to M2.
- **G1-09 — Minor — "Wherever there’s / something / to celebrate."** at 320–390 (`full-390x844-part02.png`). Not preventable at spec size; Nonso's call.
- **G1-10 — Minor (info) — 21 npm audit advisories** in dev tooling. Deferred to M4.
- **G1-11 — Minor (new) — the D-018 no-break spaces also apply on desktop.** The lessons-intro H2 now sets in four lines at 1440 (`Learn the / saxophone from / someone who / plays it for a living.`; was three lines) — no lone word, but a short ragged first line and an extra line (`full-1440x900-part04.png`). Repro: open `/` at 1440, scroll to "Saxophone lessons". Suggestion: only bind with NBSP below 640px (e.g. a phone-only span), or accept. Source: `src/content/site.ts:236`.

### Notes
- Full-page screenshots show a seam at exactly the viewport height: capture artifact of the fixed CosmosPoster (verified with viewport screenshots in run 1).
- Not yet built (by plan): consoles, widget panel, contact menu, Mobile Sheet (M1 `:target` panel, D-011), FAQ accordion (D-012), Motion toggle, hero intro, reveals, 3D, workflow, README.

## History

| Gate | Date | Result | Blockers / Majors / Minors | Notes |
|---|---|---|---|---|
| Gate 1 (run 1) | 2026-10-22 | GATE FAILED | 0 / 4 / 6 | G1-01 H1 4 lines ≥ 1536px; G1-02 Q7 btn/chip line-height; G1-03 targets < 44px; G1-04 lone words at 320 |
| Gate 1 (run 2) | 2026-10-22 | GATE PASSED | 0 / 0 / 5 | fix round 1 verified; suite 130 passed ×2; Q3 flake not reproduced |

**GATE PASSED**
