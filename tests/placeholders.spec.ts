import { test, expect } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { site } from '@/content/site';
import { placeholderList } from '@/content/derive';
import { QA_GATE, domText, onlyProject } from './helpers';

// §16.2 Q27 — list every […] string on the page; compare with the README "Before launch" list.

test('Q27: every [placeholder] on the page is listed and comes from site.ts', async ({ page }) => {
  onlyProject('desktop-chromium');
  await page.goto('/');
  const text = await domText(page);
  const found = text.match(/\[[^\]]+\]/g) ?? [];
  const counts = new Map<string, number>();
  for (const p of found) counts.set(p, (counts.get(p) ?? 0) + 1);
  const list = [...counts.entries()].map(([p, n]) => ({ placeholder: p, count: n }));
  mkdirSync('qa', { recursive: true });
  writeFileSync(`qa/placeholders-gate${QA_GATE}.json`, JSON.stringify({ total: found.length, unique: list.length, list }, null, 2));
  test.info().annotations.push({ type: 'placeholders', description: `${found.length} total, ${list.length} unique` });

  // M-10: every placeholder on the page exists in site.ts (none hard-coded in components)
  const fromSite = new Set(placeholderList(site));
  const stray = list.filter((l) => !fromSite.has(l.placeholder)).map((l) => l.placeholder);
  expect(stray, 'placeholders not from site.ts').toEqual([]);

});

test('Q27: the page placeholders exactly match the README “Before launch” list', async ({ page }) => {
  onlyProject('desktop-chromium');
  // The README "Before launch" list is an M4 deliverable.
  const readme = existsSync('README.md') ? readFileSync('README.md', 'utf8') : '';
  const hasList = /Before launch/i.test(readme);
  test.skip(!hasList && QA_GATE < 4, 'README “Before launch” list does not exist until M4 (placeholder list recorded in qa/)');
  await page.goto('/');
  const found = (await domText(page)).match(/\[[^\]]+\]/g) ?? [];
  const list = [...new Set(found)].map((placeholder) => ({ placeholder }));
  const missing = list.filter((l) => !readme.includes(l.placeholder)).map((l) => l.placeholder);
  expect(missing, 'placeholders missing from README').toEqual([]);
});
