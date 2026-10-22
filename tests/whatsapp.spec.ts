import { test, expect, type Page } from '@playwright/test';
import { site } from '@/content/site';
import { bookingMessage, generalMessage, lessonsMessage } from '@/lib/whatsapp';
import { WA_NUMBER, gate, onlyProject, waText } from './helpers';

// §16.2 WhatsApp (Q8–Q12)

const FIRST_LINES = [site.messages.bookingIntro, site.messages.lessonsIntro, site.messages.generalIntro];

async function checkAllWaLinks(page: Page) {
  const links = await page.locator('a[href*="wa.me"]').evaluateAll((els) =>
    els.map((a) => ({ href: a.getAttribute('href') ?? '', target: a.getAttribute('target'), rel: a.getAttribute('rel') ?? '', text: (a.textContent ?? '').trim() || a.getAttribute('aria-label') })),
  );
  expect(links.length).toBeGreaterThan(5);
  for (const l of links) {
    const u = new URL(l.href);
    expect(u.protocol, l.href).toBe('https:');
    expect(u.host, l.href).toBe('wa.me');
    expect(u.pathname, l.href).toBe(`/${WA_NUMBER}`);
    expect(l.target, `${l.text}: target`).toBe('_blank');
    expect(l.rel.split(/\s+/), `${l.text}: rel`).toContain('noopener');
    const first = waText(l.href).split('\n')[0];
    expect(FIRST_LINES, `${l.text}: first line "${first}"`).toContain(first);
    // encodeURIComponent: no raw spaces/newlines, %0A for line breaks
    expect(l.href).not.toMatch(/[\s+]/);
  }
  return links;
}

test('Q8: every wa.me link uses 2347040149133, target=_blank, rel noopener, and a §9.6 template', async ({ page }) => {
  await page.goto('/');
  await checkAllWaLinks(page);
});

test('Q8: same on the 404 page', async ({ page }) => {
  await page.goto('/does-not-exist');
  const n = await page.locator('a[href*="wa.me"]').count();
  expect(n).toBeGreaterThan(0);
  for (const a of await page.locator('a[href*="wa.me"]').all()) {
    const href = (await a.getAttribute('href'))!;
    expect(new URL(href).pathname).toBe(`/${WA_NUMBER}`);
    expect(await a.getAttribute('target')).toBe('_blank');
    expect(await a.getAttribute('rel')).toContain('noopener');
  }
});

test('Q8: tel: link and no other phone numbers', async ({ page }) => {
  await page.goto('/');
  const tels = await page.locator('a[href^="tel:"]').evaluateAll((els) => els.map((a) => a.getAttribute('href')));
  expect(tels.length).toBeGreaterThan(0);
  for (const t of tels) expect(t).toBe('tel:+2347040149133');
  const html = await page.content();
  expect(html).not.toContain('2349036033056');
  expect(html).not.toContain('0903 603 3056');
});

test.describe('Q12 no-JS', () => {
  test.use({ javaScriptEnabled: false });

  test('Q12: hero CTAs, nav button and widget are wa.me links with the default templates', async ({ page }) => {
    await page.goto('/');
    await checkAllWaLinks(page);
    const href = async (loc: ReturnType<Page['locator']>) => waText((await loc.getAttribute('href'))!);
    expect(await href(page.locator('#top a', { hasText: site.hero.primaryCta }))).toBe(bookingMessage());
    expect(await href(page.locator('#top a', { hasText: site.hero.secondaryCta }))).toBe(lessonsMessage());
    expect(await href(page.locator('header a', { hasText: site.nav.cta }).first())).toBe(generalMessage());
    expect(await href(page.locator(`a[aria-label="${site.widget.ariaLabel}"]`))).toBe(generalMessage());
    // Other CTAs per HANDOFF-M1 mapping
    expect(await href(page.locator('#occasions a', { hasText: site.occasions.cta }))).toBe(bookingMessage());
    expect(await href(page.locator('#lessons-intro a', { hasText: site.lessonsIntro.cta }))).toBe(lessonsMessage());
    expect(await href(page.locator('#lessons-formats a', { hasText: site.lessonsFormats.cta }))).toBe(lessonsMessage());
    expect(await href(page.locator('#contact a', { hasText: site.finalCta.cta1 }))).toBe(bookingMessage());
    expect(await href(page.locator('#contact a', { hasText: site.finalCta.cta2 }))).toBe(lessonsMessage());
  });

  test('Q12: hero portrait and H1 render with JS off (M-15: LCP never waits on JS)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const img = page.locator('#top img').first();
    await expect(img).toBeVisible();
    expect(await img.getAttribute('fetchpriority')).toBe('high');
    const op = await img.evaluate((el) => getComputedStyle(el).opacity);
    expect(op).toBe('1');
    const loaded = await img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0);
    expect(loaded).toBe(true);
  });

  test('Q12/M-07: Menu works without JS (opens the menu panel with the four links)', async ({ page }) => {
    test.skip(test.info().project.name !== 'mobile-chromium', 'Menu is shown below 860px');
    await page.goto('/');
    const menu = page.locator('header a[href="#mobile-menu"]');
    await expect(menu).toBeVisible();
    await menu.click();
    for (const l of site.nav.links) {
      await expect(page.locator('#mobile-menu').getByRole('link', { name: l.label })).toBeVisible();
    }
  });
});

// Q11 — static part at Gate 1 (position, size, no overlap with footer text); the panel is Gate 2.
for (const width of [320, 390, 1440]) {
  test(`Q11: widget visible bottom-right at ${width}px and never overlaps footer text`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    const ctx = await browser.newContext({ viewport: { width, height: 800 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/');
    const btn = page.locator(`a[aria-label="${site.widget.ariaLabel}"]`);
    await expect(btn).toBeVisible();
    const circle = page.locator('.wa-widget__circle');
    const box = (await circle.boundingBox())!;
    const edge = Math.min(28, Math.max(16, width * 0.03));
    expect(Math.abs(width - (box.x + box.width) - edge), 'right offset').toBeLessThanOrEqual(1);
    expect(Math.abs(800 - (box.y + box.height) - edge), 'bottom offset').toBeLessThanOrEqual(1);
    expect(Math.round(box.width)).toBe(60);
    expect(Math.round(box.height)).toBe(60);
    const bg = await circle.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(37, 211, 102)');
    // Label chip only at >= 640px
    const chipVisible = await page.locator('.wa-widget__chip').isVisible();
    expect(chipVisible, 'chip visibility').toBe(width >= 640);
    if (chipVisible) await expect(page.locator('.wa-widget__chip')).toHaveText(site.widget.chip);

    // Scroll to the bottom; no footer text/link box intersects the widget (button + chip)
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(300);
    const wBox = (await btn.boundingBox())!;
    const hits = await page.evaluate((w) => {
      const out: string[] = [];
      const els = document.querySelectorAll('footer *, #contact *');
      for (const el of Array.from(els)) {
        for (const n of Array.from(el.childNodes)) {
          if (n.nodeType !== 3 || !n.textContent!.trim()) continue;
          const r = document.createRange();
          r.selectNodeContents(n);
          for (const rect of Array.from(r.getClientRects())) {
            if (rect.right > w.x && rect.left < w.x + w.width && rect.bottom > w.y && rect.top < w.y + w.height)
              out.push(n.textContent!.trim());
          }
        }
      }
      return out;
    }, wBox);
    expect(hits, 'text under the widget').toEqual([]);
    await ctx.close();
  });
}

test('Q9: Booking Console (opens from hero CTA, exact message, unfixed date, Esc returns focus)', async () => {
  gate(2, 'Booking Console');
});

test('Q10: Lessons Console (full/empty message, age visibility, format question)', async () => {
  gate(2, 'Lessons Console');
});

test('Q11: widget panel opens with three correct links; Esc closes', async () => {
  gate(2, 'widget panel');
});
