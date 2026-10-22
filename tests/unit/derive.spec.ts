import { test, expect } from '@playwright/test';
import { site, type Site } from '@/content/site';
import {
  coverageParagraphs,
  faqItems,
  galleryCounter,
  galleryItems,
  isPlayableVideo,
  lessonFormats,
  lessonsConsoleQuestions,
  lessonsLead,
  lessonsMicrocopy,
  pathsCards,
  placeholderList,
  videoAction,
  whoCards,
} from '@/content/derive';

// §16.2 Q6 — flag behaviour, pure helpers, every combination. No rebuild needed.

type Lessons = Site['lessons'];
const make = (lessons: Partial<Lessons> = {}, performance: Partial<Site['performance']> = {}): Site => ({
  ...site,
  lessons: { ...site.lessons, ...lessons },
  performance: { ...site.performance, ...performance },
});

const bools = [true, false];
const formatCombos = bools.flatMap((home) => bools.flatMap((online) => bools.map((group) => ({ home, online, group }))));
const youngCombos = [
  { enabled: true, minAge: null },
  { enabled: true, minAge: 8 },
  { enabled: false, minAge: null },
  { enabled: false, minAge: 8 },
] as Lessons['youngLearners'][];

const T = site.lessonsFormats.cards;
const F = site.faq;

for (const fmt of formatCombos) {
  for (const young of youngCombos) {
    const label = `home=${fmt.home} online=${fmt.online} group=${fmt.group} young=${young.enabled} minAge=${young.minAge}`;
    test(`Q6 lessons flags: ${label}`, () => {
      const s = make({ ...fmt, youngLearners: young });

      // Lessons intro lead (§6.8) — throws when neither home nor online (OQ-9)
      if (!fmt.home && !fmt.online) {
        expect(() => lessonsLead(s)).toThrow(/lessons\.home or lessons\.online/);
      } else if (fmt.home && fmt.online) {
        expect(lessonsLead(s)).toBe('One-on-one lessons at your home in Lagos, or by video call.');
      } else if (fmt.home) {
        expect(lessonsLead(s)).toBe('One-on-one lessons at your home in Lagos. Start from zero, or finally fix the habits YouTube taught you.');
      } else {
        expect(lessonsLead(s)).toBe('One-on-one lessons by video call, wherever you are.');
      }

      // Format cards: only enabled ones, in order
      const cards = lessonFormats(s);
      const expectTitles = [
        ...(fmt.home ? [T.home.title] : []),
        ...(fmt.online ? [T.online.title] : []),
        ...(fmt.group ? [T.group.title] : []),
      ];
      expect(cards.map((c) => c.title)).toEqual(expectTitles);
      const home = cards.find((c) => c.key === 'home');
      if (home) expect(home.body).toBe('Wale comes to your home, anywhere in Lagos. One-on-one.');
      for (const c of cards) expect(c.price).toBe('Ask for a price on WhatsApp');

      // Coverage lessons paragraph only when home
      expect(coverageParagraphs(s).includes(site.coverage.lessonsBody)).toBe(fmt.home);

      // Console questions (§9.3)
      const q = lessonsConsoleQuestions(s);
      const n = expectTitles.length;
      expect(q.askFormat).toBe(n > 1);
      expect(q.impliedFormat).toBe(n === 1 ? q.formats[0] : null);
      expect(q.areaAlways).toBe(n === 1 && fmt.home);

      // Young learners: who-cards, paths card copy, FAQ age item
      const who = whoCards(s).map((c) => c.key);
      expect(who.includes('young')).toBe(young.enabled);
      const youngCard = whoCards(s).find((c) => c.key === 'young');
      if (youngCard) {
        const base = 'Patient, structured lessons that keep children and teens practising — and proud to play for the family.';
        expect(youngCard.body).toBe(young.minAge != null ? `${base} From age ${young.minAge}.` : base);
      }
      const lessonsCard = pathsCards(s)[1];
      expect(lessonsCard.body.includes('young learners and')).toBe(young.enabled);

      const faqL = faqItems(s).find((g) => g.id === 'lessons')!.items;
      const age = faqL.find((i) => i.q === F.lessons.age.q);
      if (!young.enabled) expect(age).toBeUndefined();
      else if (young.minAge != null) expect(age?.a).toBe(`Lessons are for adults and young learners from age ${young.minAge}.`);
      else expect(age?.a).toBe(F.lessons.age.noMinAge);
    });
  }
}

test('Q6 lessons: lessonLength and price fill the format cards and FAQ', () => {
  const s = make({ home: true, online: true, lessonLength: '60 minutes', price: '₦40,000 / month · 4 lessons' });
  const cards = lessonFormats(s);
  expect(cards[0].body).toBe('Wale comes to your home, anywhere in Lagos. One-on-one, 60 minutes per lesson.');
  for (const c of cards) expect(c.price).toBe('₦40,000 / month · 4 lessons');
  const often = faqItems(s).find((g) => g.id === 'lessons')!.items.find((i) => i.q === F.lessons.often.q)!;
  expect(often.a).toBe(`${F.lessons.often.a} Lessons are ₦40,000 / month · 4 lessons.`);
  const oftenNull = faqItems(make()).find((g) => g.id === 'lessons')!.items.find((i) => i.q === F.lessons.often.q)!;
  expect(oftenNull.a).toBe(F.lessons.often.a);
});

test('Q6 lessons: trial microcopy', () => {
  expect(lessonsMicrocopy(make({ trial: null }))).toBe('Send your level and area on WhatsApp — Wale will suggest a plan.');
  expect(lessonsMicrocopy(make({ trial: 'First lesson free' }))).toBe('First lesson free · Send your level and area on WhatsApp.');
});

test('Q6 lessons: advisesOnInstruments switches the “own saxophone” answer', () => {
  const ownA = (v: boolean) =>
    faqItems(make({ advisesOnInstruments: v })).find((g) => g.id === 'lessons')!.items.find((i) => i.q === F.lessons.own.q)!.a;
  expect(ownA(true)).toBe('You’ll need one to practise between lessons. If you don’t have one yet, ask Wale before you buy — he’ll tell you what to look for.');
  expect(ownA(false)).toBe('You’ll need one to practise between lessons.');
});

for (const sound of [null, 'own', 'venue', 'either'] as const) {
  for (const price of [null, '₦150,000']) {
    test(`Q6 performance flags: bringsSound=${sound} startingPrice=${price}`, () => {
      const s = make({}, { bringsSound: sound, startingPrice: price });
      const perf = faqItems(s).find((g) => g.id === 'performances')!.items;
      const soundItem = perf.find((i) => i.q === F.performances.sound.q);
      if (sound === null) expect(soundItem).toBeUndefined();
      else expect(soundItem?.a).toBe(F.performances.sound[sound]);
      // order: cost, travel, song, [sound], early
      expect(perf.map((i) => i.q)).toEqual([
        F.performances.cost.q, F.performances.travel.q, F.performances.song.q,
        ...(sound ? [F.performances.sound.q] : []), F.performances.early.q,
      ]);
      const cost = perf[0].a;
      expect(cost).toBe(price ? `${F.performances.cost.a} Packages start from ₦150,000.` : F.performances.cost.a);
    });
  }
}

test('Q6 gallery: 1–24 items, counter, video behaviour', () => {
  expect(() => galleryItems({ ...site, gallery: [] })).toThrow();
  const many = Array.from({ length: 25 }, (_, i) => ({ ...site.gallery[1], id: `x${i}` }));
  expect(() => galleryItems({ ...site, gallery: many })).toThrow();
  expect(galleryItems({ ...site, gallery: many.slice(0, 24) })).toHaveLength(24);
  expect(galleryCounter(site, 1)).toBe('02 / 05');
  const v = site.gallery[0];
  expect(isPlayableVideo(v)).toBe(false); // neither videoSrc nor externalUrl → behaves like a photo
  expect(isPlayableVideo({ ...v, videoSrc: '/videos/x.mp4' })).toBe(true);
  expect(videoAction({ ...v, externalUrl: 'https://www.instagram.com/p/abc' })).toBe('instagram');
  expect(videoAction({ ...v, externalUrl: 'https://youtu.be/abc' })).toBe('youtube');
  expect(() => videoAction({ ...v, externalUrl: 'https://vimeo.com/1' })).toThrow();
});

test('Q6 placeholders: placeholderList finds every [BRACKET] in site.ts', () => {
  const list = placeholderList(site);
  expect(list.length).toBeGreaterThan(0);
  for (const p of list) expect(p).toMatch(/^\[[^\]]+\]$/);
});
