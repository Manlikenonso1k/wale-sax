import { test, expect, type Page } from '@playwright/test';
import { site } from '@/content/site';
import {
  coverageParagraphs,
  faqItems,
  galleryItems,
  instagramLink,
  lessonFormats,
  lessonsLead,
  lessonsMicrocopy,
  pathsCards,
  whoCards,
} from '@/content/derive';
import { domText, norm, plain } from './helpers';

// §16.2 Q5 — every heading, paragraph, card, step, FAQ item and CTA label in §6 is present,
// with exact text, driven by site.ts. Runs with JS on and with JS off (M-02: SSR text).

const headings: { level: 'h1' | 'h2'; text: string }[] = [
  { level: 'h1', text: site.hero.h1Words.join(' ') },
  ...[
    site.paths.heading, site.why.heading, site.occasions.heading, site.bookingSteps.heading,
    site.hosts.heading, site.coverage.heading, site.lessonsIntro.heading, site.lessonsPas.heading,
    site.lessonsWho.heading, site.lessonsPath.heading, site.lessonsFormats.heading,
    site.students.heading, site.watch.heading, site.faq.heading, site.finalCta.heading,
  ].map((text) => ({ level: 'h2' as const, text })),
];

const ig = instagramLink(site);

/** Strings that must appear verbatim in the rendered DOM text. */
const strings: string[] = [
  // Global
  ...site.nav.links.map((l) => l.label), site.nav.cta, site.role,
  site.widget.chip,
  site.footer.tagline, site.footer.whatsappLabel, `${site.footer.instagramLabel} · ${ig.handle}`, site.footer.copyright,
  // Hero
  site.hero.eyebrow, site.hero.lead, site.hero.primaryCta, site.hero.secondaryCta, site.hero.microcopy,
  ...site.stats.flatMap((s) => [s.value, s.label]),
  // Paths
  site.paths.eyebrow, ...pathsCards(site).flatMap((c) => [c.label, c.title, c.body, c.link]),
  // Chapters
  site.chapters.performances, site.chapters.lessons, site.chapters.watch,
  // Why
  site.why.eyebrow, site.why.body, site.why.emphasis, ...site.why.features.flatMap((f) => [f.n, f.title, f.body]),
  // Occasions
  site.occasions.eyebrow, ...site.occasions.cards.flatMap((c) => [c.title, c.body]), site.occasions.footer, site.occasions.cta,
  // Pull quote
  site.pullQuote.quote, site.pullQuote.caption,
  // Booking steps
  site.bookingSteps.eyebrow, ...site.bookingSteps.steps.flatMap((s) => [s.n, s.title, s.body]),
  site.bookingSteps.genresLabel, ...site.performance.genres, site.bookingSteps.yourSong,
  // Hosts
  site.hosts.eyebrow, ...site.hosts.cards.flatMap((c) => [c.quote, c.name, c.meta]),
  // Coverage
  site.coverage.eyebrow, ...coverageParagraphs(site), ...site.areas, site.coverage.moreChip, site.coverage.note,
  site.coverage.mapCaption,
  // Lessons intro
  site.lessonsIntro.eyebrow, lessonsLead(site), site.lessonsIntro.cta, lessonsMicrocopy(site),
  // PAS
  site.lessonsPas.eyebrow, site.lessonsPas.p1, site.lessonsPas.p2, site.lessonsPas.p3,
  // Who
  site.lessonsWho.eyebrow, ...whoCards(site).flatMap((c) => [c.title, c.body]),
  // Path
  site.lessonsPath.eyebrow, site.lessonsPath.intro, ...site.lessonsPath.stages.flatMap((s) => [s.n, s.title, s.body]),
  // Formats
  site.lessonsFormats.eyebrow, ...lessonFormats(site).flatMap((c) => [c.title, c.body, c.price]),
  ...(site.lessons.advisesOnInstruments ? [site.lessonsFormats.instrumentNote] : []), site.lessonsFormats.cta,
  // Students
  site.students.eyebrow, ...site.students.cards.flatMap((c) => [c.quote, c.name, c.meta]),
  // Gallery
  site.watch.eyebrow, `${site.watch.instagramLink} · ${ig.handle}`,
  // FAQ
  site.faq.eyebrow, site.faq.groups.performances, site.faq.groups.lessons,
  ...faqItems(site).flatMap((g) => g.items.flatMap((i) => [i.q, i.a])),
  // Final CTA
  site.finalCta.eyebrow, site.finalCta.body, site.finalCta.cta1, site.finalCta.cta2,
  `${site.finalCta.callPrefix} ${site.whatsapp.display}`,
];

/** CTA labels that must be links. */
const ctaLinks: string[] = [
  site.nav.cta, site.hero.primaryCta, site.hero.secondaryCta, site.occasions.cta, site.lessonsIntro.cta,
  site.lessonsFormats.cta, site.finalCta.cta1, site.finalCta.cta2,
  ...pathsCards(site).map((c) => c.link), site.footer.whatsappLabel,
];

/** Image alts from §6. */
const alts: string[] = [
  site.hero.image.alt, site.lessonsIntro.image.alt, ...site.occasions.cards.map((c) => c.alt),
  ...galleryItems(site).map((g) => g.alt),
];

async function checkContent(page: Page) {
  const text = await domText(page);
  const missing = strings.filter((s) => !text.includes(norm(s)));
  expect(missing, 'strings missing from the rendered DOM text').toEqual([]);

  for (const h of headings) {
    const loc = page.locator(h.level).filter({ hasText: plain(h.text).split(' ')[0] });
    const texts = (await loc.allTextContents()).map(norm);
    expect(texts, `${h.level} "${plain(h.text)}"`).toContain(norm(plain(h.text)));
    // *emphasis* renders as <em>
    const em = /\*([^*]+)\*/.exec(h.text)?.[1];
    if (em) {
      const ems = await page.locator(`${h.level} em`).allTextContents();
      expect(ems.map(norm), `<em> in "${plain(h.text)}"`).toContain(norm(em));
    }
  }

  for (const label of ctaLinks) {
    const n = await page.locator('a').filter({ hasText: label }).count();
    expect(n, `link "${label}"`).toBeGreaterThan(0);
  }

  const imgAlts = await page.locator('img').evaluateAll((els) => els.map((e) => e.getAttribute('alt') ?? ''));
  for (const a of alts) expect(imgAlts, `img alt "${a}"`).toContain(a);

  // Gallery captions (DOM fallback)
  for (const g of galleryItems(site)) expect(text).toContain(g.caption);
}

test('Q5: all §6 content present with exact text (JS on)', async ({ page }) => {
  await page.goto('/');
  await checkContent(page);
});

test.describe('JS off (M-02 server-rendered text)', () => {
  test.use({ javaScriptEnabled: false });
  test('Q5: all §6 content present with exact text (JS off)', async ({ page }) => {
    await page.goto('/');
    await checkContent(page);
  });
});

test('Q5: heading outline — one h1, h2 per section, no skipped levels', async ({ page }) => {
  await page.goto('/');
  const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((els) =>
    els.map((e) => Number(e.tagName.slice(1))),
  );
  expect(levels[0]).toBe(1);
  expect(levels.filter((l) => l === 1)).toHaveLength(1);
  for (let i = 1; i < levels.length; i++) {
    expect(levels[i] - levels[i - 1], `heading #${i} jumps from h${levels[i - 1]} to h${levels[i]}`).toBeLessThanOrEqual(1);
  }
});

test('Q5: every section has aria-labelledby pointing at its heading (§11)', async ({ page }) => {
  await page.goto('/');
  const bad = await page.locator('main section').evaluateAll((els) =>
    els
      .filter((s) => {
        const id = s.getAttribute('aria-labelledby');
        return !id || !document.getElementById(id);
      })
      .map((s) => s.id || s.className),
  );
  expect(bad, 'sections without a valid aria-labelledby').toEqual([]);
});

// D-018: no-break spaces may steer line breaks but must not change any word of §6.
// These are the §6 strings verbatim from BUILD-PROMPT.md (ordinary spaces).
test('Q5/D-018: headings with no-break spaces keep the exact §6 words', async ({ page }) => {
  const spec: Record<string, string> = {
    'lessons-title': 'Learn the saxophone from someone who plays it for a living.',
    'pas-title': 'The saxophone isn’t hard. Learning it alone is.',
    'coverage-title': 'Based in Ajah. Plays — and teaches — anywhere.',
    'occasions-title': 'Wherever there’s something to celebrate.',
    'why-title': 'Every party has a playlist. Yours can have a moment.',
  };
  await page.goto('/');
  for (const [id, text] of Object.entries(spec)) {
    const raw = (await page.locator('#' + id).textContent()) ?? '';
    // only U+0020 / U+00A0 may differ; no other characters
    expect(raw.replace(/\u00A0/g, ' ').replace(/\s+/g, ' ').trim(), id).toBe(text);
    expect(raw, id).not.toMatch(/[\u200B\u2060\u00AD]/); // no zero-width / soft-hyphen tricks
  }
  // site.ts strings equal §6 once NBSP is read as a space
  const all = [site.lessonsIntro.heading, site.lessonsPas.heading, site.coverage.heading].map((h) => plain(h).replace(/\u00A0/g, ' '));
  expect(all).toEqual([spec['lessons-title'], spec['pas-title'], spec['coverage-title']]);
});
