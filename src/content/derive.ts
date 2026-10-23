/**
 * Pure helpers that turn the flags in site.ts into what the page shows (§6, §16.2 Q6).
 * No React, no DOM: unit-testable with any combination of flags.
 */
import type { GalleryItem, Site } from './site';

const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, k: string) => String(values[k] ?? ''));

export type FormatKey = 'home' | 'online' | 'group';

/** Paths cards, with the young-learners wording dropped when that flag is off. */
export function pathsCards(s: Site) {
  return s.paths.cards.map((c) => ({
    ...c,
    body: !s.lessons.youngLearners.enabled && c.bodyNoYoung ? c.bodyNoYoung : c.body,
  }));
}

/** Coverage paragraphs: the lessons paragraph shows only when lessons.home is true. */
export function coverageParagraphs(s: Site): string[] {
  return s.lessons.home ? [s.coverage.body, s.coverage.lessonsBody] : [s.coverage.body];
}

/** Lessons intro lead (§6.8). Throws when no lesson location is enabled (OQ-9). */
export function lessonsLead(s: Site): string {
  const { home, online } = s.lessons;
  if (home && online) return s.lessonsIntro.leadBoth;
  if (home) return s.lessonsIntro.leadHome;
  if (online) return s.lessonsIntro.leadOnline;
  throw new Error('site.ts: enable lessons.home or lessons.online (at least one must be true).');
}

/** Microcopy under the lessons CTA. */
export function lessonsMicrocopy(s: Site): string {
  return s.lessons.trial ? fill(s.lessonsIntro.microTrial, { trial: s.lessons.trial }) : s.lessonsIntro.microDefault;
}

/** “Who it’s for” cards (young learners only when enabled; min age suffix when set). */
export function whoCards(s: Site) {
  const { enabled, minAge } = s.lessons.youngLearners;
  return s.lessonsWho.cards
    .filter((c) => c.key !== 'young' || enabled)
    .map((c) =>
      c.key === 'young' && minAge != null
        ? { ...c, body: c.body + fill(s.lessonsWho.minAgeSuffix, { minAge }) }
        : c,
    );
}

/** Enabled lesson formats, in display order. */
export function enabledFormats(s: Site): FormatKey[] {
  return (['home', 'online', 'group'] as const).filter((k) => s.lessons[k]);
}

/** Price line on each format card. */
export function formatPriceLine(s: Site): string {
  return s.lessons.price ?? s.lessonsFormats.priceFallback;
}

/** Lesson format cards (only enabled ones). */
export function lessonFormats(s: Site) {
  const length = s.lessons.lessonLength
    ? fill(s.lessonsFormats.lengthSuffix, { lessonLength: s.lessons.lessonLength })
    : '';
  const price = formatPriceLine(s);
  return enabledFormats(s).map((key) => {
    const card = s.lessonsFormats.cards[key];
    return { key, title: card.title, body: fill(card.body, { length }), price };
  });
}

export type FaqItem = { id: string; q: string; a: string };
export type FaqGroup = { id: 'performances' | 'lessons'; label: string; items: FaqItem[] };

/** FAQ groups and items with every flag applied (§6.10). */
export function faqItems(s: Site): FaqGroup[] {
  const p = s.faq.performances;
  const l = s.faq.lessons;
  const perf: FaqItem[] = [
    {
      id: 'faq-cost',
      q: p.cost.q,
      a: p.cost.a + (s.performance.startingPrice ? fill(p.cost.withPrice, { startingPrice: s.performance.startingPrice }) : ''),
    },
    { id: 'faq-travel', q: p.travel.q, a: p.travel.a },
    { id: 'faq-song', q: p.song.q, a: p.song.a },
  ];
  if (s.performance.bringsSound) {
    perf.push({ id: 'faq-sound', q: p.sound.q, a: p.sound[s.performance.bringsSound] });
  }
  perf.push({ id: 'faq-early', q: p.early.q, a: p.early.a });

  const les: FaqItem[] = [
    { id: 'faq-never', q: l.never.q, a: l.never.a },
    { id: 'faq-own', q: l.own.q, a: s.lessons.advisesOnInstruments ? l.own.advises : l.own.plain },
  ];
  const { enabled, minAge } = s.lessons.youngLearners;
  if (enabled) {
    les.push({ id: 'faq-age', q: l.age.q, a: minAge != null ? fill(l.age.withMinAge, { minAge }) : l.age.noMinAge });
  }
  les.push({
    id: 'faq-often',
    q: l.often.q,
    a: l.often.a + (s.lessons.price ? fill(l.often.withPrice, { price: s.lessons.price }) : ''),
  });
  les.push({ id: 'faq-genres', q: l.genres.q, a: l.genres.a });

  return [
    { id: 'performances', label: s.faq.groups.performances, items: perf },
    { id: 'lessons', label: s.faq.groups.lessons, items: les },
  ];
}

/** Which questions the Lessons Console asks (§9.3). */
export function lessonsConsoleQuestions(s: Site) {
  const formats = enabledFormats(s);
  return {
    formats,
    /** The format question is hidden when only one format is enabled. */
    askFormat: formats.length > 1,
    /** Format sent automatically when the question is hidden. */
    impliedFormat: formats.length === 1 ? formats[0] : null,
    /** Area is always shown when home is the only format; otherwise only when Home is picked. */
    areaAlways: formats.length === 1 && formats[0] === 'home',
  };
}

/** Gallery items, validated (1–40). */
export function galleryItems(s: Site): GalleryItem[] {
  const items = s.gallery;
  if (items.length < 1 || items.length > 40) {
    throw new Error(`site.ts: the gallery needs 1 to 40 items (it has ${items.length}).`);
  }
  return items;
}

/** A video item with neither source behaves like a photo. */
export function isPlayableVideo(item: GalleryItem): boolean {
  return item.kind === 'video' && Boolean(item.videoSrc || item.externalUrl);
}

/** Which button an external video gets (OQ-13). */
export function videoAction(item: GalleryItem): 'instagram' | 'youtube' | null {
  if (!item.externalUrl) return null;
  const host = new URL(item.externalUrl).hostname.replace(/^www\./, '');
  if (host === 'instagram.com') return 'instagram';
  if (host === 'youtube.com' || host === 'youtu.be' || host === 'm.youtube.com') return 'youtube';
  throw new Error(`site.ts: gallery item "${item.id}" externalUrl must be an Instagram or YouTube link.`);
}

/** Name shown in the footer: “Wale” plus the full name when set. */
export function footerName(s: Site): { name: string; fullName: string | null } {
  return { name: s.name, fullName: s.fullName };
}

/** Instagram: a link when the URL is set, otherwise the visible placeholder text. */
export function instagramLink(s: Site): { href: string | null; handle: string } {
  return {
    href: s.instagram.url,
    handle: s.instagram.handle ?? s.footer.instagramPlaceholder,
  };
}

/** Zero-padded gallery counter, e.g. “01 / 05”. */
export function galleryCounter(s: Site, index: number): string {
  const total = galleryItems(s).length;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(index + 1)}${s.watch.counterSep}${pad(total)}`;
}

/** Every [BRACKET] placeholder string in the content, in page order (feeds README/Q27). */
export function placeholderList(s: Site): string[] {
  const found: string[] = [];
  const visit = (v: unknown) => {
    if (typeof v === 'string') {
      for (const m of v.match(/\[[^\]]+\]/g) ?? []) found.push(m);
    } else if (Array.isArray(v)) v.forEach(visit);
    else if (v && typeof v === 'object') Object.values(v).forEach(visit);
  };
  visit(s);
  return found;
}
