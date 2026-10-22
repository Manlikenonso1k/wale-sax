import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { site } from '@/content/site';
import { onlyProject } from './helpers';

// §16.2 Q26 — SEO and metadata (§13)

test('Q26: meta description, canonical, og:image (absolute), twitter:card, theme-color', async ({ page }) => {
  onlyProject('desktop-chromium');
  await page.goto('/');
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc).toBe(site.seo.description);
  expect(desc!.length).toBeGreaterThanOrEqual(120);
  expect(desc!.length).toBeLessThanOrEqual(160);
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  expect(canonical).toBeTruthy();
  // URL hosts are case-insensitive; Next normalises siteUrl through new URL().
  const base = new URL(site.siteUrl).href; // e.g. https://your-domain.com/
  expect(new URL(canonical!).href).toBe(base);
  const og = await page.locator('meta[property="og:image"]').first().getAttribute('content');
  expect(og).toMatch(/^https?:\/\//);
  expect(new URL(og!).href).toBe(new URL('/_img/og.jpg', site.siteUrl).href);
  expect(await page.locator('meta[property="og:image:width"]').getAttribute('content')).toBe('1200');
  expect(await page.locator('meta[property="og:image:height"]').getAttribute('content')).toBe('630');
  expect(await page.locator('meta[property="og:type"]').getAttribute('content')).toBe('website');
  expect(await page.locator('meta[property="og:locale"]').getAttribute('content')).toBe('en_NG');
  expect(await page.locator('meta[property="og:title"]').getAttribute('content')).toBe(site.seo.title);
  expect(await page.locator('meta[name="twitter:card"]').getAttribute('content')).toBe('summary_large_image');
  expect(await page.locator('meta[name="theme-color"]').getAttribute('content')).toBe('#0A090B');
  // og.jpg exists and is served
  const res = await page.request.get('/_img/og.jpg');
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('image/jpeg');
});

test('Q26: JSON-LD parses; one Person + two Service; no AggregateRating/Review', async ({ page }) => {
  onlyProject('desktop-chromium');
  await page.goto('/');
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(blocks.length).toBe(1);
  const data = JSON.parse(blocks[0]);
  const graph: Record<string, unknown>[] = data['@graph'];
  expect(Array.isArray(graph)).toBe(true);
  const persons = graph.filter((g) => g['@type'] === 'Person');
  const services = graph.filter((g) => g['@type'] === 'Service');
  expect(persons).toHaveLength(1);
  expect(services).toHaveLength(2);
  const p = persons[0] as Record<string, unknown>;
  expect(p['@id']).toBe(`${site.siteUrl}/#wale`);
  expect(p.jobTitle).toBe('Saxophonist');
  expect(p.telephone).toBe('+2347040149133');
  expect(JSON.stringify(p.address)).toContain('Ajah');
  expect(services.map((s) => s.name).sort()).toEqual(['Live saxophone performance', 'Saxophone lessons']);
  for (const s of services) {
    expect((s.provider as Record<string, string>)['@id']).toBe(`${site.siteUrl}/#wale`);
    expect(JSON.stringify(s.areaServed)).toContain('Lagos');
  }
  const raw = blocks[0];
  expect(raw).not.toMatch(/AggregateRating|"Review"|ratingValue/);
});

test('Q26: out/robots.txt and out/sitemap.xml reference siteUrl', async ({ page }) => {
  onlyProject('desktop-chromium');
  const robots = readFileSync('out/robots.txt', 'utf8');
  const sitemap = readFileSync('out/sitemap.xml', 'utf8');
  expect(robots).toMatch(/User-Agent: \*/i);
  expect(robots).toMatch(/Allow: \//);
  expect(robots).toContain(`${site.siteUrl}/sitemap.xml`);
  expect(sitemap).toContain(`<loc>${site.siteUrl}/</loc>`);
  expect((sitemap.match(/<url>/g) ?? []).length).toBe(1);
  // and they are served
  expect((await page.request.get('/robots.txt')).status()).toBe(200);
  expect((await page.request.get('/sitemap.xml')).status()).toBe(200);
});

test('§13: icon.svg is a brass W drawn as paths (no <text>) on #0A090B', async ({ page }) => {
  onlyProject('desktop-chromium');
  const svg = readFileSync('src/app/icon.svg', 'utf8');
  expect(svg).not.toMatch(/<text/i);
  expect(svg).toMatch(/<path/);
  expect(svg.toUpperCase()).toContain('#0A090B');
  expect(svg.toUpperCase()).toContain('#D4A64A');
  await page.goto('/');
  const icon = await page.locator('link[rel="icon"]').first().getAttribute('href');
  expect(icon).toContain('icon.svg');
  expect((await page.request.get(icon!)).status()).toBe(200);
});
