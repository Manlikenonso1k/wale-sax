import { test, type Page } from '@playwright/test';

/** Which QA gate is being run (BUILD-PROMPT §2.2). Default: 1. */
export const QA_GATE = Number(process.env.QA_GATE ?? 1);

/** Skip a test that belongs to a later gate. */
export function gate(n: number, what = '') {
  test.skip(QA_GATE < n, `Not in Gate ${QA_GATE} scope (Gate ${n}${what ? `: ${what}` : ''})`);
}

/** Run a test in one browser project only (for viewport-independent checks). */
export function onlyProject(name: string) {
  test.skip(test.info().project.name !== name, `Runs in ${name} only`);
}

export const LEGACY_URL = 'http://localhost:4174';
export const WA_NUMBER = '2347040149133';

/** Strip `*emphasis*` markup from site.ts strings. */
export const plain = (s: string) => s.replace(/\*/g, '');

/** Collapse whitespace. */
export const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

/**
 * The page's rendered text from the DOM (textContent, so CSS text-transform does not
 * change it), excluding <script>/<style>/<noscript> (the RSC payload duplicates copy).
 */
export async function domText(page: Page): Promise<string> {
  const raw = await page.evaluate(() => {
    const clone = document.body.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('script, style, noscript, template').forEach((n) => n.remove());
    // Separate block elements so words from neighbours do not run together.
    clone.querySelectorAll('*').forEach((el) => el.append(' '));
    return clone.textContent ?? '';
  });
  return norm(raw);
}

/** Wait until both families are loaded and layout is stable. */
export async function fontsReady(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

/** Scroll the whole page in steps (to trigger lazy loads / reveals). */
export async function scrollThrough(page: Page, step = 600, pause = 60) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(pause);
  }
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(pause);
}

/** Decode the `text` param of a wa.me link. */
export function waText(href: string): string {
  const u = new URL(href);
  return u.searchParams.get('text') ?? '';
}
