import { test, expect, type Browser, type Page } from '@playwright/test';
import { LEGACY_URL, fontsReady, onlyProject } from './helpers';

// §16.2 Q7 — typography parity with legacy/index.html, plus the §5.4 table and the
// lone-word rule (§5.4 / §16.4). Runs once (desktop project) and opens its own
// 320/360/390/1440 contexts.

type Style = {
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  lineHeight: number | 'normal';
  letterSpacing: number;
};

async function styleOf(page: Page, selector: string): Promise<Style> {
  const loc = page.locator(selector).first();
  await expect(loc, `element ${selector}`).toHaveCount(1, { timeout: 5000 }).catch(() => undefined);
  return loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
    return {
      fontFamily: cs.fontFamily,
      fontSize: parseFloat(cs.fontSize),
      fontWeight: cs.fontWeight,
      fontStyle: cs.fontStyle,
      lineHeight: cs.lineHeight === 'normal' ? 'normal' : parseFloat(cs.lineHeight),
      letterSpacing: ls,
    } as Style;
  });
}

/** [role, new-site selector, legacy selector] */
const PAIRS: [string, string, string][] = [
  ['H1', 'h1', 'h1'],
  ['Why live sax H2', '#why-title', 'h2:has-text("Every party has a playlist")'],
  ['Eyebrow (Why live sax)', '#why .t-eyebrow', 'p:text-is("Why live sax")'],
  ['Lead (hero)', '.hero__lead', 'h1 + p'],
  ['Body paragraph (Why)', '#why .t-body', 'p:has-text("You know the kind of event")'],
  ['Card title (occasion)', '#occasions h3 >> nth=0', 'h3:text-is("Weddings")'],
  ['Button (hero primary, L)', '.hero__ctas a >> nth=0', 'h1 ~ div a.btn >> nth=0'],
  ['Chip (area: Ajah)', '#coverage li.chip >> nth=0', 'li:text-is("Ajah")'],
  ['Wordmark (nav)', 'header .wordmark__name', 'header span:text-is("Wale")'],
];

const familyClass = (f: string) => (/Bodoni/.test(f) ? 'Bodoni' : /Instrument/.test(f) ? 'Instrument' : `OTHER(${f})`);

async function open(browser: Browser, url: string, width: number) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'load' });
  await fontsReady(page);
  return { ctx, page };
}

for (const width of [390, 1440]) {
  test(`Q7: typography matches legacy at ${width}px`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    const a = await open(browser, '/', width);
    const b = await open(browser, LEGACY_URL + '/', width);
    const problems: string[] = [];
    for (const [role, sel, legacySel] of PAIRS) {
      const n = await styleOf(a.page, sel);
      const l = await styleOf(b.page, legacySel);
      const fam = [familyClass(n.fontFamily), familyClass(l.fontFamily)];
      if (fam[0] !== fam[1]) problems.push(`${role}: font-family ${fam[0]} vs legacy ${fam[1]}`);
      if (Math.abs(n.fontSize - l.fontSize) > 0.5) problems.push(`${role}: font-size ${n.fontSize}px vs legacy ${l.fontSize}px`);
      if (n.fontWeight !== l.fontWeight) problems.push(`${role}: font-weight ${n.fontWeight} vs legacy ${l.fontWeight}`);
      if (n.fontStyle !== l.fontStyle) problems.push(`${role}: font-style ${n.fontStyle} vs legacy ${l.fontStyle}`);
      if (role.startsWith('Card title')) {
        // OQ-2 (accepted, D-006): card-title line-height follows §5.4 (1.15), not legacy's inherited 1.5.
        const want = n.fontSize * 1.15;
        if (n.lineHeight === 'normal' || Math.abs(n.lineHeight - want) > 0.5)
          problems.push(`${role}: line-height ${n.lineHeight} vs §5.4 ${want.toFixed(2)}px (OQ-2)`);
      } else if (n.lineHeight === 'normal' || l.lineHeight === 'normal') {
        if (n.lineHeight !== l.lineHeight) problems.push(`${role}: line-height ${n.lineHeight} vs legacy ${l.lineHeight}`);
      } else if (Math.abs(n.lineHeight - l.lineHeight) > 0.5) {
        problems.push(`${role}: line-height ${n.lineHeight.toFixed(2)}px vs legacy ${l.lineHeight.toFixed(2)}px`);
      }
      if (Math.abs(n.letterSpacing - l.letterSpacing) > 0.005 * n.fontSize + 1e-6)
        problems.push(`${role}: letter-spacing ${n.letterSpacing}px vs legacy ${l.letterSpacing}px`);
    }
    await a.ctx.close();
    await b.ctx.close();
    expect(problems).toEqual([]);
  });
}

test('Q7: document.fonts.check() passes for both families (normal + italic Bodoni)', async ({ browser }) => {
  onlyProject('desktop-chromium');
  const { ctx, page } = await open(browser, '/', 1440);
  const res = await page.evaluate(() => {
    const first = (sel: string) => getComputedStyle(document.querySelector(sel)!).fontFamily.split(',')[0].trim();
    const bodoni = first('h1');
    const inst = first('body');
    return {
      bodoni,
      inst,
      bodoniNormal: document.fonts.check(`500 48px ${bodoni}`),
      bodoniItalic: document.fonts.check(`italic 500 48px ${bodoni}`),
      instrument: document.fonts.check(`400 16px ${inst}`),
      instrumentBold: document.fonts.check(`600 16px ${inst}`),
      loaded: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => `${f.family} ${f.style} ${f.weight}`),
    };
  });
  await ctx.close();
  expect(res.bodoni).toMatch(/Bodoni/);
  expect(res.inst).toMatch(/Instrument/);
  expect(res.bodoniNormal).toBe(true);
  expect(res.bodoniItalic).toBe(true);
  expect(res.instrument).toBe(true);
  expect(res.instrumentBold).toBe(true);
  expect(res.loaded.some((f) => /Bodoni/.test(f) && /italic/.test(f))).toBe(true);
  expect(res.loaded.some((f) => /Bodoni/.test(f) && /normal/.test(f))).toBe(true);
  expect(res.loaded.some((f) => /Instrument/.test(f))).toBe(true);
});

test('M-01: no typeface other than Bodoni Moda / Instrument Sans on any text element', async ({ browser }) => {
  onlyProject('desktop-chromium');
  for (const url of ['/', '/does-not-exist']) {
    const { ctx, page } = await open(browser, url, 1440);
    const others = await page.evaluate(() => {
      const out: string[] = [];
      for (const el of Array.from(document.body.querySelectorAll('*'))) {
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(el.tagName)) continue;
        const hasText = Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim());
        if (!hasText) continue;
        const ff = getComputedStyle(el).fontFamily.split(',')[0];
        if (!/Bodoni|Instrument/.test(ff)) out.push(`${el.tagName}.${el.className}: ${ff}`);
      }
      return out;
    });
    await ctx.close();
    expect(others, url).toEqual([]);
  }
});

// §5.4 table, checked on the new site directly (sizes that legacy does not have).
const clamp = (min: number, vw: number, max: number, w: number) => Math.min(max, Math.max(min, (vw * w) / 100));
type Spec = { sel: string; fam: 'Bodoni' | 'Instrument'; size: (w: number) => number; weight?: string; style?: string; lh?: number; ls?: number };
const SPECS: Record<string, Spec> = {
  'Wordmark nav': { sel: 'header .wordmark__name', fam: 'Bodoni', size: () => 28, weight: '600', style: 'italic', lh: 1, ls: -0.01 },
  'Wordmark footer': { sel: 'footer .wordmark__name', fam: 'Bodoni', size: () => 24, weight: '600', style: 'italic', lh: 1, ls: -0.01 },
  'Eyebrow': { sel: '#paths .t-eyebrow', fam: 'Instrument', size: () => 12, weight: '600', ls: 0.22 },
  'H1': { sel: 'h1', fam: 'Bodoni', size: (w) => clamp(48, 6.2, 89.6, w), weight: '500', style: 'normal', lh: 0.98, ls: -0.025 },
  'H1 emphasis': { sel: 'h1 em', fam: 'Bodoni', size: (w) => clamp(48, 6.2, 89.6, w), weight: '500', style: 'italic' },
  'H2': { sel: '#paths-title', fam: 'Bodoni', size: (w) => clamp(36, 4.2, 57.6, w), weight: '500', lh: 1.04, ls: -0.02 },
  'H2 emphasis': { sel: '#paths-title em', fam: 'Bodoni', size: (w) => clamp(36, 4.2, 57.6, w), weight: '500', style: 'italic' },
  'H2 final': { sel: '#final-title', fam: 'Bodoni', size: (w) => clamp(41.6, 5.4, 73.6, w), weight: '500', lh: 1.0, ls: -0.025 },
  'Card title (paths)': { sel: '#paths h3', fam: 'Bodoni', size: () => 26, weight: '500', lh: 1.15, ls: -0.01 },
  'Card title (formats)': { sel: '#lessons-formats h3', fam: 'Bodoni', size: () => 26, weight: '500', lh: 1.15, ls: -0.01 },
  'H3 feature': { sel: '#why h3', fam: 'Instrument', size: () => 19, weight: '600', lh: 1.3, ls: -0.01 },
  'H3 step': { sel: '#booking-steps h3', fam: 'Instrument', size: () => 19, weight: '600', lh: 1.3, ls: -0.01 },
  'H3 who-for': { sel: '#lessons-who h3', fam: 'Instrument', size: () => 19, weight: '600', lh: 1.3, ls: -0.01 },
  'Numeral feature': { sel: '#why .t-num-sm', fam: 'Bodoni', size: () => 18, style: 'italic', lh: 1 },
  'Numeral step': { sel: '#booking-steps .t-num-lg', fam: 'Bodoni', size: () => 48, style: 'italic', lh: 1 },
  'Stat value': { sel: '.t-stat-value', fam: 'Bodoni', size: () => 32, weight: '500', lh: 1.1 },
  'Stat label': { sel: '.t-stat-label', fam: 'Instrument', size: () => 13, weight: '400', ls: 0.04 },
  'Lead': { sel: '.hero__lead', fam: 'Instrument', size: (w) => clamp(16.8, 1.35, 19.2, w), weight: '400', lh: 1.6 },
  'Body': { sel: '#coverage .t-body', fam: 'Instrument', size: () => 17, weight: '400', lh: 1.7 },
  'Emphasis paragraph': { sel: '#why .t-emph', fam: 'Instrument', size: () => 20, weight: '400', lh: 1.6 },
  'Card body': { sel: '#occasions .t-card-body', fam: 'Instrument', size: () => 15, weight: '400', lh: 1.6 },
  'Pull quote': { sel: '.t-pull', fam: 'Bodoni', size: (w) => clamp(25.6, 3, 38.4, w), weight: '400', style: 'italic', lh: 1.3, ls: -0.01 },
  'Testimonial quote': { sel: '#hosts .t-quote', fam: 'Bodoni', size: () => 21, weight: '400', style: 'italic', lh: 1.45 },
  'Caption (pull figcaption)': { sel: '.pull figcaption', fam: 'Instrument', size: () => 12, weight: '600', ls: 0.2 },
  'Chip': { sel: '#booking-steps .chip', fam: 'Instrument', size: () => 14, weight: '400' },
  'Button S (nav)': { sel: 'header a.btn--s', fam: 'Instrument', size: () => 14, weight: '600' },
  'Button M': { sel: 'a.btn--m', fam: 'Instrument', size: () => 15, weight: '600' },
  'Button L': { sel: 'a.btn--l', fam: 'Instrument', size: () => 16, weight: '600' },
  'Button XL': { sel: 'a.btn--xl', fam: 'Instrument', size: () => 17, weight: '600' },
  'FAQ question': { sel: '.t-faq-q', fam: 'Instrument', size: () => 18, weight: '500', lh: 1.4 },
  'Nav link': { sel: '.nav__link', fam: 'Instrument', size: () => 14, weight: '400' },
};

for (const width of [390, 1440]) {
  test(`M-01: §5.4 type table at ${width}px`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    const { ctx, page } = await open(browser, '/', width);
    const problems: string[] = [];
    for (const [role, s] of Object.entries(SPECS)) {
      if (role === 'Nav link' && width < 860) continue; // links live in the Menu below 860px
      const st = await styleOf(page, s.sel);
      if (familyClass(st.fontFamily) !== s.fam) problems.push(`${role}: family ${st.fontFamily}`);
      const size = s.size(width);
      if (Math.abs(st.fontSize - size) > 0.5) problems.push(`${role}: size ${st.fontSize} vs ${size.toFixed(2)}`);
      if (s.weight && st.fontWeight !== s.weight) problems.push(`${role}: weight ${st.fontWeight} vs ${s.weight}`);
      if (s.style && st.fontStyle !== s.style) problems.push(`${role}: style ${st.fontStyle} vs ${s.style}`);
      if (s.lh !== undefined && (st.lineHeight === 'normal' || Math.abs(st.lineHeight - s.lh * st.fontSize) > 0.5))
        problems.push(`${role}: line-height ${st.lineHeight} vs ${(s.lh * st.fontSize).toFixed(2)}`);
      if (s.ls !== undefined && Math.abs(st.letterSpacing - s.ls * st.fontSize) > 0.005 * st.fontSize + 1e-6)
        problems.push(`${role}: letter-spacing ${st.letterSpacing} vs ${(s.ls * st.fontSize).toFixed(3)}`);
    }
    // Italic emphasis is brass
    const emColor = await page.locator('h1 em').evaluate((el) => getComputedStyle(el).color);
    if (emColor !== 'rgb(212, 166, 74)') problems.push(`H1 em colour ${emColor}`);
    // Button heights 44/48/56/60
    for (const [cls, h] of [['btn--s', 44], ['btn--m', 48], ['btn--l', 56], ['btn--xl', 60]] as const) {
      const bh = await page.locator(`a.${cls}`).first().evaluate((el) => el.getBoundingClientRect().height);
      if (Math.abs(bh - h) > 0.5) problems.push(`${cls} height ${bh} vs ${h}`);
    }
    await ctx.close();
    expect(problems).toEqual([]);
  });
}

// §5.4: "On phones (< 640px), no headline may break into a lone word on its own line where
// text-wrap: balance can prevent it. Check at 320, 360 and 390px."
// "Can prevent it" is decided by measurement: a lone-word line is preventable when the
// heading's words (measured widths, same font) can be broken into lines of >= 2 words that
// each fit the heading's width. D-017 (Orchestrator): the H1 "Live" alone at 320–360px is accepted.
for (const width of [320, 360, 390]) {
  test(`§5.4: no preventable lone-word headline lines at ${width}px`, async ({ browser }) => {
    onlyProject('desktop-chromium');
    const { ctx, page } = await open(browser, '/', width);
    const lone = await page.evaluate(() => {
      const out: { tag: string; id: string; lines: string[]; preventable: boolean; alt: string[] }[] = [];
      for (const h of Array.from(document.querySelectorAll<HTMLElement>('h1, h2'))) {
        const words: { w: string; top: number; left: number; right: number }[] = [];
        const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const t = node.textContent ?? '';
          const re = /\S+/g;
          let m: RegExpExecArray | null;
          while ((m = re.exec(t))) {
            const r = document.createRange();
            r.setStart(node, m.index);
            r.setEnd(node, m.index + m[0].length);
            const rect = r.getClientRects()[0];
            if (rect) words.push({ w: m[0], top: rect.top, left: rect.left, right: rect.right });
          }
        }
        const lines: (typeof words)[] = [];
        let lastTop = -1e9;
        for (const w of words) {
          if (Math.abs(w.top - lastTop) > 6) {
            lines.push([]);
            lastTop = w.top;
          }
          lines[lines.length - 1].push(w);
        }
        if (!(lines.length > 1 && lines.some((l) => l.length === 1))) continue;
        // Space width from same-line neighbours
        const gaps = lines.flatMap((l) => l.slice(1).map((w, i) => w.left - l[i].right)).filter((g) => g > 0).sort((a, b) => a - b);
        const fs = parseFloat(getComputedStyle(h).fontSize);
        const space = gaps.length ? gaps[Math.floor(gaps.length / 2)] : fs * 0.25;
        const cs = getComputedStyle(h);
        const W = h.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
        const wd = words.map((w) => w.right - w.left);
        const lineW = (a: number, b: number) => wd.slice(a, b).reduce((x, y) => x + y, 0) + space * (b - a - 1);
        // DP: can words[0..n) be split into lines of >= 2 words that fit?
        const n = words.length;
        const prev: number[] = Array(n + 1).fill(-2);
        prev[0] = -1;
        for (let i = 2; i <= n; i++)
          for (let j = 0; j <= i - 2; j++)
            if (prev[j] !== -2 && lineW(j, i) <= W + 0.5) { prev[i] = j; break; }
        const alt: string[] = [];
        if (prev[n] !== -2) for (let i = n; i > 0; i = prev[i]) alt.unshift(words.slice(prev[i], i).map((w) => w.w).join(' '));
        out.push({ tag: h.tagName, id: h.id, lines: lines.map((l) => l.map((w) => w.w).join(' ')), preventable: prev[n] !== -2, alt });
      }
      return out;
    });
    await ctx.close();
    test.info().annotations.push({ type: 'lone-words', description: JSON.stringify(lone) });
    const unexpected = lone.filter((l) => l.preventable && !(l.tag === 'H1' && width <= 360)); // D-017
    expect(unexpected, JSON.stringify(lone, null, 1)).toEqual([]);
  });
}

// VIS / D-007: at >= 900px the hero H1 must set in three lines ("Live saxophone, / delivered to /
// your door.") with no lone word — the Designer's D-007 claims this holds from 900 to 2560px.
test('D-007: hero H1 has no lone-word line at desktop widths 900–2560px', async ({ browser }) => {
  onlyProject('desktop-chromium');
  const bad: string[] = [];
  for (const width of [900, 1024, 1280, 1366, 1440, 1536, 1600, 1920, 2560]) {
    const { ctx, page } = await open(browser, '/', width);
    const lines = await page.evaluate(() => {
      const tops = Array.from(document.querySelectorAll('h1 .hero__word')).map((w) => Math.round(w.getBoundingClientRect().top));
      const words = Array.from(document.querySelectorAll('h1 .hero__word')).map((w) => w.textContent);
      const out: string[][] = [];
      tops.forEach((t, i) => {
        if (i === 0 || Math.abs(t - tops[i - 1]) > 6) out.push([]);
        out[out.length - 1].push(words[i] ?? '');
      });
      return out.map((l) => l.join(' '));
    });
    await ctx.close();
    if (lines.some((l) => !l.includes(' '))) bad.push(`${width}px: ${JSON.stringify(lines)}`);
  }
  expect(bad).toEqual([]);
});
