# Decisions log

Decisions not fixed by `docs/BUILD-PROMPT.md`, or deviations from it. Newest at the bottom.

| ID | Date | Decision | Why | By |
|---|---|---|---|---|
| D-001 | 2026-10-22 | WhatsApp number is **0704 014 9133** (`2347040149133`), replacing 0903 603 3056 everywhere in BUILD-PROMPT.md, including the verbatim `prepare-deploy.mjs`. | Nonso confirmed the new number; the live legacy page already uses it. | Orchestrator (Nonso approved) |
| D-002 | 2026-10-22 | Local Playwright and Lighthouse use the **installed Google Chrome** (`channel: 'chrome'`, Chrome 150) instead of Playwright's bundled Chromium. The `webkit-iphone` project is skipped. | The dev machine runs macOS 12 (Intel). Playwright 1.64 refuses to install its browsers there ("does not support chromium on mac12"). Installed Chrome 150 launches through Playwright with WebGL2 available in headless mode. CI does not run browsers, so the deploy pipeline is unaffected. | Orchestrator |
| D-003 | 2026-10-22 | `create-next-app@16.4.2` scaffolded Tailwind through `@tailwindcss/turbopack` and a `turbopack.rules` entry in `next.config.ts`, which also had `cacheComponents` and `partialPrefetching`. §4.5 requires `next.config.ts` verbatim, so those are dropped; the Planner chooses the Tailwind integration that works with the verbatim config (see PLAN.md). | Keep §4.5 verbatim; `cacheComponents` is not needed for a static export. | Orchestrator |
| D-004 | 2026-10-22 | Tailwind CSS 4.3.3 is integrated through **`@tailwindcss/postcss` 4.3.3 + `postcss.config.mjs`** (`plugins: { "@tailwindcss/postcss": {} }`). `@tailwindcss/turbopack` and the scaffold `turbopack.rules` are removed. | Works with the verbatim §4.5 `next.config.ts`. Verified in a scratch static export: Turbopack build compiled, theme utilities emitted, `tsc --noEmit` passed. | Planner |
| D-005 | 2026-10-22 | All dependencies are pinned to **exact** versions (no `^`), as listed in `docs/PLAN.md` §3; `react`/`react-dom` move to 19.3.1, `@types/node` to 22.20.5 (matches `.nvmrc`), `@types/three` 0.186.0 added. | Reproducible installs on Windows and CI; keeps TypeScript 5.9.3 and ESLint 9.39.5 from drifting to the forbidden 7.x/10.x; full set verified to resolve with plain `npm install`. | Planner |
| D-006 | 2026-10-22 | Orchestrator accepts all PLAN.md open questions OQ-1 … OQ-19 with the Planner's proposed resolutions. Notably OQ-1: the §12 "first-load JS ≤ 200 KB" budget counts only scripts referenced by `out/index.html`; post-interactive idle chunks (SmoothScroll, OverlayHost, FxLayer) get their own ≤ 150 KB budget, and every CTA works before they load. | Measured: Next 16 + React 19 alone is 170.8 KB gz, and eager GSAP/Lenis/Motion/Radix adds 135 KB, so the literal reading is impossible. The other resolutions are design choices §2.4 says to decide, not escalate. | Orchestrator |

## Environment notes for all roles

- Node 22.23.4 and npm 10.9.9 are in `~/.local/node/bin`. Prefix shell commands with `export PATH="$HOME/.local/node/bin:$PATH";`.
- macOS 12.7.6, Intel. Homebrew and the Xcode Command Line Tools are **not** available: no `python3`, no compilers.
- Playwright: use `channel: 'chrome'` (see D-002). Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Work happens on branch `rebuild`. Only the Orchestrator commits and pushes.
