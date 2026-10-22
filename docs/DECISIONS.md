# Decisions log

Decisions not fixed by `docs/BUILD-PROMPT.md`, or deviations from it. Newest at the bottom.

| ID | Date | Decision | Why | By |
|---|---|---|---|---|
| D-001 | 2026-10-22 | WhatsApp number is **0704 014 9133** (`2347040149133`), replacing 0903 603 3056 everywhere in BUILD-PROMPT.md, including the verbatim `prepare-deploy.mjs`. | Nonso confirmed the new number; the live legacy page already uses it. | Orchestrator (Nonso approved) |
| D-002 | 2026-10-22 | Local Playwright and Lighthouse use the **installed Google Chrome** (`channel: 'chrome'`, Chrome 150) instead of Playwright's bundled Chromium. The `webkit-iphone` project is skipped. | The dev machine runs macOS 12 (Intel). Playwright 1.64 refuses to install its browsers there ("does not support chromium on mac12"). Installed Chrome 150 launches through Playwright with WebGL2 available in headless mode. CI does not run browsers, so the deploy pipeline is unaffected. | Orchestrator |
| D-003 | 2026-10-22 | `create-next-app@16.4.2` scaffolded Tailwind through `@tailwindcss/turbopack` and a `turbopack.rules` entry in `next.config.ts`, which also had `cacheComponents` and `partialPrefetching`. §4.5 requires `next.config.ts` verbatim, so those are dropped; the Planner chooses the Tailwind integration that works with the verbatim config (see PLAN.md). | Keep §4.5 verbatim; `cacheComponents` is not needed for a static export. | Orchestrator |

## Environment notes for all roles

- Node 22.23.4 and npm 10.9.9 are in `~/.local/node/bin`. Prefix shell commands with `export PATH="$HOME/.local/node/bin:$PATH";`.
- macOS 12.7.6, Intel. Homebrew and the Xcode Command Line Tools are **not** available: no `python3`, no compilers.
- Playwright: use `channel: 'chrome'` (see D-002). Chrome is at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Work happens on branch `rebuild`. Only the Orchestrator commits and pushes.
