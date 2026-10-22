import { test, expect, type Page } from '@playwright/test';
import { gate, scrollThrough } from './helpers';

// §16.2 Interaction and motion (Q13–Q18). M2 scope (Gate 2).

const HIDDEN_OK = '[hidden], [inert], [aria-hidden="true"], .sr-only, [data-state="closed"], [role="dialog"]';

async function invisibleContent(page: Page) {
  return page.evaluate((skip) => {
    const out: string[] = [];
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('main h1, main h2, main h3, main p, main li, main a, main button'))) {
      if (el.closest(skip)) continue;
      let op = 1;
      for (let n: HTMLElement | null = el; n; n = n.parentElement) op *= parseFloat(getComputedStyle(n).opacity);
      const r = el.getBoundingClientRect();
      if (op < 0.99 || r.width === 0 || r.height === 0) out.push(`${el.tagName} "${(el.textContent ?? '').trim().slice(0, 40)}" opacity=${op.toFixed(2)} ${Math.round(r.width)}×${Math.round(r.height)}`);
    }
    return out;
  }, HIDDEN_OK);
}

test('Q13: nothing stuck invisible after scrolling through with motion on', async ({ page }) => {
  gate(2, 'scroll reveals');
  await page.goto('/', { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  await scrollThrough(page, 300, 250);
  await page.waitForTimeout(1200);
  expect(await invisibleContent(page)).toEqual([]);
});

test('Q14: reduced motion — no canvas, no lenis, DOM gallery, all visible at t=0', async ({ page }) => {
  gate(2, 'reduced motion');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/', { waitUntil: 'load' });
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(await page.locator('html').getAttribute('class')).not.toMatch(/\blenis\b/);
  await expect(page.locator('[data-gallery="dom"]')).toHaveCount(1);
  expect(await invisibleContent(page)).toEqual([]);
});

test('Q15: Motion toggle removes canvases, persists across reload, restores', async () => {
  gate(2, 'motion toggle');
});

test('Q16: nav anchors and /#lessons deep link land with the heading visible below the sticky nav', async ({ page }) => {
  gate(2, 'anchors with Lenis');
  for (const hash of ['#performances', '#lessons', '#gallery', '#faq']) {
    await page.goto('/' + hash, { waitUntil: 'load' });
    await page.waitForTimeout(800);
    const r = await page.evaluate((h) => {
      const sec = document.querySelector(h)!;
      const heading = sec.querySelector('h2, .chapter__label')!;
      const nav = document.querySelector('header.nav')!.getBoundingClientRect();
      const hb = heading.getBoundingClientRect();
      return { navBottom: nav.bottom, top: hb.top, bottom: hb.bottom, vh: innerHeight };
    }, hash);
    expect(r.top, hash).toBeGreaterThanOrEqual(r.navBottom - 1);
    expect(r.bottom, hash).toBeLessThanOrEqual(r.vh);
  }
});

test('Q17: Mobile Sheet opens, links navigate and close it, drag-down dismisses', async () => {
  gate(2, 'Mobile Sheet');
});

test('Q18: FAQ aria-expanded toggles; Enter/Space work', async () => {
  gate(2, 'FAQ accordion');
});
