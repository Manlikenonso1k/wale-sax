import { test } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { QA_GATE, gate, onlyProject } from './helpers';

// §16.4 Visual review matrix. Screenshots go to qa/screenshots/gate<N>/ and are
// reviewed by eye (findings in docs/QA-REPORT.md). These tests never fail on pixels.

const DIR = `qa/screenshots/gate${QA_GATE}`;
const SIZES = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1440, 900],
  [1920, 1080],
] as const;
const SLICE = 1400;

for (const [w, h] of SIZES) {
  test(`VIS: full page, motion off, ${w}×${h}`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    mkdirSync(DIR, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce', deviceScaleFactor: 1 });
    await ctx.addInitScript(() => {
      try {
        localStorage.setItem('wale-motion', 'off');
      } catch {}
    });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    // load every lazy image before the full-page capture
    await page.evaluate(async () => {
      for (const img of Array.from(document.images)) img.loading = 'eager';
      await Promise.all(Array.from(document.images).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${DIR}/full-${w}x${h}.png`, fullPage: true });
    // Readable slices of the same page for review
    const total = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0, i = 0; y < total; y += SLICE, i++) {
      await page.screenshot({
        path: `${DIR}/full-${w}x${h}-part${String(i).padStart(2, '0')}.png`,
        fullPage: true,
        clip: { x: 0, y, width: w, height: Math.min(SLICE, total - y) },
      });
    }
    await ctx.close();
  });
}

for (const [w, h] of [[390, 844], [1440, 900]] as const) {
  test(`VIS: 404 page, motion off, ${w}×${h}`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    mkdirSync(DIR, { recursive: true });
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/does-not-exist', { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `${DIR}/404-${w}x${h}.png`, fullPage: true });
    await ctx.close();
  });
}

test('VIS: hero viewport, motion on (after 2s), 390 and 1440', async () => {
  gate(2, 'motion');
});

test('VIS: gallery viewport ?tier=high at 390, 1440, 1920', async () => {
  gate(3, '3D gallery');
});

test('VIS: each pop-up open at 390 and 1440', async () => {
  gate(2, 'pop-ups');
});
