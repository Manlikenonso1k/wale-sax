import { defineConfig, devices } from '@playwright/test';

/**
 * QA suite (BUILD-PROMPT §16). Always runs against the exported files in out/,
 * served statically on :4173 (never `next dev`).
 *
 * Browsers: Playwright cannot install its own browsers on the macOS 12 QA machine,
 * so every browser project uses the installed Google Chrome (`channel: 'chrome'`, D-002).
 * The `webkit-iphone` project (§16.1) is skipped for the same reason (see docs/QA-REPORT.md).
 *
 * Gate scoping: tests that belong to a later gate call `gate(n)` (tests/helpers.ts) and are
 * reported as SKIPPED until QA_GATE >= n. Run e.g. `QA_GATE=2 npx playwright test`.
 */
const BASE_URL = 'http://localhost:4173';

export default defineConfig({
  testDir: './tests',
  outputDir: './qa/test-results',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  workers: 4,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list'], ['json', { outputFile: 'qa/results.json' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npx serve out -l 4173',
      url: BASE_URL,
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      // Typography parity reference (§16.2 Q7)
      command: 'npx serve legacy -l 4174',
      url: 'http://localhost:4174',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'unit',
      testMatch: /(unit\/.*|ci)\.spec\.ts$/,
    },
    {
      name: 'desktop-chromium',
      testIgnore: /(unit\/|ci\.spec\.ts$)/,
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chromium',
      testIgnore: /(unit\/|ci\.spec\.ts$)/,
      use: { ...devices['Pixel 7'], channel: 'chrome' },
    },
    {
      // §16.2 Q20: WebGL disabled at the browser level (Gate 3).
      name: 'no-webgl',
      testMatch: /three\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--disable-webgl', '--disable-3d-apis'] },
      },
    },
    // webkit-iphone (iPhone 14): SKIPPED — WebKit cannot be installed on macOS 12 (D-002).
  ],
});
