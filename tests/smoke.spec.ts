import { test, expect } from '@playwright/test';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '@/content/site';
import { plain, scrollThrough, onlyProject } from './helpers';

// §16.2 Smoke and export (Q1–Q4)

test('Q1: / returns 200, has the §13 title and exactly one h1 containing "Live saxophone"', async ({ page }) => {
  const res = await page.goto('/');
  expect(res?.status()).toBe(200);
  await expect(page).toHaveTitle('Wale | Saxophonist for Hire & Saxophone Lessons in Lagos');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Live saxophone');
});

test('Q2: no console errors (or page errors) while loading and scrolling', async ({ page }) => {
  // Allowed: none at Gate 1. (Later gates may allow GPU/WebGL performance notices from headless Chrome.)
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  await page.goto('/', { waitUntil: 'load' });
  await scrollThrough(page);
  await page.waitForTimeout(500);
  expect(errors).toEqual([]);
});

test('Q3: no failed requests (4xx/5xx) and no third-party requests while scrolling the full page', async ({ page }) => {
  const failed: string[] = [];
  const foreign: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  // Aborted requests (net::ERR_ABORTED) are cancelled by the browser itself — e.g. a lazy
  // image whose fetch is dropped/re-prioritised while the page scrolls fast — not a failure of
  // the server. They are recorded and checked below: every image must still end up loaded.
  const aborted: string[] = [];
  page.on('requestfailed', (r) => {
    const err = r.failure()?.errorText ?? '';
    if (/ERR_ABORTED/.test(err)) aborted.push(r.url());
    else failed.push(`FAILED ${r.url()} ${err}`);
  });
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (!['localhost:4173'].includes(u.host) && !u.protocol.startsWith('data') && !u.protocol.startsWith('blob')) {
      foreign.push(r.url());
    }
  });
  await page.goto('/', { waitUntil: 'load' });
  await scrollThrough(page, 400, 120);
  await page.waitForLoadState('networkidle');
  expect(failed, 'failed requests').toEqual([]);
  if (aborted.length) test.info().annotations.push({ type: 'aborted-requests', description: aborted.join(' ') });
  // Nothing lost: every image on the page is loaded once the scroll has finished.
  await page.evaluate(async () => {
    for (const img of Array.from(document.images)) img.loading = 'eager';
    await Promise.all(Array.from(document.images).map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  });
  const broken = await page.evaluate(() => Array.from(document.images).filter((i) => !(i.complete && i.naturalWidth > 0)).map((i) => i.currentSrc || i.src));
  expect(broken, 'images not loaded').toEqual([]);
  expect(foreign, 'third-party requests (M-16)').toEqual([]);
});

test('Q4a: out/ contains every file prepare-deploy.mjs requires', async () => {
  onlyProject('desktop-chromium');
  const required = [
    'index.html', '404.html', '.htaccess', '_next/static/.htaccess',
    'robots.txt', 'sitemap.xml', '_img/og.jpg', 'images/wale-hero.jpg',
  ];
  const missing = required.filter((f) => !existsSync(join('out', f)));
  expect(missing).toEqual([]);
});

test('Q4b: /does-not-exist serves the branded 404 page', async ({ page }) => {
  const res = await page.goto('/does-not-exist');
  expect(res?.status()).toBe(404);
  const n = site.notFound;
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveText(plain(n.heading));
  await expect(page.getByText(n.eyebrow, { exact: true })).toBeVisible();
  await expect(page.getByText(n.body, { exact: true })).toBeVisible();
  const home = page.getByRole('link', { name: n.home });
  await expect(home).toBeVisible();
  expect(await home.getAttribute('href')).toBe('/');
  // §6.12: plus the WhatsApp widget
  await expect(page.locator('a[aria-label="Chat with Wale on WhatsApp"]')).toBeVisible();
  // Same fonts (Bodoni on the H1)
  const ff = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
  expect(ff).toMatch(/Bodoni/);
});
