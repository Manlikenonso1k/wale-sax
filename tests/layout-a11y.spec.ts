import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { gate, onlyProject } from './helpers';

// §16.2 Layout and accessibility (Q23–Q25) + M-12 touch targets

const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1920, 2560];

test('Q23: no horizontal overflow from 320 to 2560px', async ({ browser }) => {
  onlyProject('desktop-chromium');
  test.setTimeout(240_000);
  const problems: string[] = [];
  for (const width of WIDTHS) {
    for (const url of ['/', '/does-not-exist']) {
      const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      const page = await ctx.newPage();
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const doc = document.documentElement;
        // Elements whose right edge passes the viewport (helps locate the culprit)
        const wide = Array.from(document.body.querySelectorAll('*'))
          .filter((el) => {
            const b = el.getBoundingClientRect();
            return b.width > 0 && b.right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed';
          })
          .slice(0, 5)
          .map((el) => `${el.tagName}.${String(el.className).slice(0, 40)}`);
        return { sw: doc.scrollWidth, bw: document.body.scrollWidth, iw: window.innerWidth, wide };
      });
      if (r.sw > r.iw || r.bw > r.iw) problems.push(`${url} @${width}: scrollWidth ${r.sw}/${r.bw} > ${r.iw} ${r.wide.join(', ')}`);
      await ctx.close();
    }
  }
  expect(problems).toEqual([]);
});

for (const url of ['/', '/does-not-exist']) {
  test(`Q24: axe — zero serious/critical violations on ${url}`, async ({ page }) => {
    await page.goto(url, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    const bad = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.impact} ${v.id}: ${v.help} — ${v.nodes.map((n) => n.target.join(' ')).slice(0, 6).join(' | ')}`);
    const minor = results.violations
      .filter((v) => !(v.impact === 'serious' || v.impact === 'critical'))
      .map((v) => `${v.impact} ${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`);
    test.info().annotations.push({ type: 'axe-moderate-minor', description: JSON.stringify(minor) });
    expect(bad).toEqual([]);
  });
}

test('Q24: axe with each pop-up open (Booking, Lessons, Contact Menu, Widget, Lightbox, Mobile Sheet)', async () => {
  gate(2, 'pop-ups');
});

test('Q25: keyboard-only — every interactive element reachable, visible focus ring, not under the sticky nav', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  const focusable = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])'))
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return cs.visibility !== 'hidden' && cs.display !== 'none' && r.width > 0 && r.height > 0 && !el.closest('[inert],[aria-hidden="true"]');
      }).length,
  );
  const seen = new Set<string>();
  const problems: string[] = [];
  let first = '';
  for (let i = 0; i < 400; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const key = el.outerHTML.slice(0, 160) + '@' + Array.from(document.querySelectorAll('*')).indexOf(el);
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      const cx = Math.min(window.innerWidth - 1, Math.max(0, r.left + r.width / 2));
      const cy = Math.min(window.innerHeight - 1, Math.max(0, r.top + Math.min(r.height / 2, 10)));
      const top = document.elementFromPoint(cx, cy);
      const covered = !!top && top !== el && !el.contains(top);
      const coveredByNav = covered && !!top!.closest('header');
      const ring = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
      return {
        key,
        label: (el.textContent || el.getAttribute('aria-label') || el.tagName).trim().slice(0, 40),
        ring,
        outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`,
        visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight,
        underNav: coveredByNav,
        coveredBy: covered ? (top!.className || top!.tagName).toString().slice(0, 40) : '',
        fixed: !!el.closest('.wa-widget'),
      };
    });
    if (!info) continue;
    if (i === 0) first = info.label;
    if (seen.has(info.key)) break;
    seen.add(info.key);
    if (!info.ring) problems.push(`no focus ring: ${info.label} (${info.outline})`);
    if (!info.visible) problems.push(`focused element off-screen: ${info.label}`);
    if (info.underNav && !info.fixed) problems.push(`hidden behind sticky nav: ${info.label} (under ${info.coveredBy})`);
  }
  expect(first, 'skip link is the first focusable element').toBe('Skip to content');
  expect(seen.size, 'tab stops vs focusable elements').toBeGreaterThanOrEqual(focusable);
  expect(problems).toEqual([]);
});

test('M-12: interactive targets are at least 44×44px', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  const small = await page.evaluate(() =>
    Array.from(document.querySelectorAll<HTMLElement>('a[href], button, input, summary'))
      .filter((el) => {
        const cs = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        if (cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0) return false;
        if (el.classList.contains('skip-link')) return false;
        return r.height < 44 - 0.5 || r.width < 44 - 0.5;
      })
      .map((el) => {
        const r = el.getBoundingClientRect();
        return `${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)} ${Math.round(r.width)}×${Math.round(r.height)}`;
      }),
  );
  expect(small).toEqual([]);
});

test('M-12: one <h1>, landmarks header>nav, main, footer, lang en-NG', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-NG');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('body > footer, footer')).toHaveCount(1);
  expect(await page.locator('header nav').count()).toBeGreaterThan(0);
});
