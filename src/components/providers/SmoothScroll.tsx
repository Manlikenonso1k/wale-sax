'use client';

/**
 * Deferred motion layer (§10.3, PLAN OQ-1): Lenis smooth scroll on GSAP's ticker, plus
 * every scroll reveal, scrub and chapter tint. Loaded only when motion is on, after idle.
 *
 * Pitfall 13: no element is hidden by static CSS. Initial hidden states are set here with
 * gsap, only for elements still below the reveal line, and everything is reverted when
 * this layer unmounts (Motion toggle off), so content can never stay invisible.
 */
import 'lenis/dist/lenis.css';
import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { bus } from '@/lib/scroll-bus';
import { reveal, stagger } from '@/lib/motion-tokens';

gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);

const REVEAL_LINE = 0.8; // “about 80% into the viewport” (§7)
const isBelow = (el: Element) => el.getBoundingClientRect().top > window.innerHeight * REVEAL_LINE;
const once = (trigger: Element, start = 'top 80%') => ({ trigger, start, once: true });

function revealGroups() {
  // Cards and lists: children rise (or float with depth) in batches as they enter.
  for (const group of gsap.utils.toArray<HTMLElement>('[data-reveal="rise"], [data-reveal="float"]')) {
    const items = (Array.from(group.children) as HTMLElement[]).filter(isBelow);
    if (!items.length) continue;
    const float = group.dataset.reveal === 'float';
    const each = Number(group.dataset.stagger ?? 90) / 1000;
    const from = float ? { opacity: 0, y: 48, z: -90, transformPerspective: 900 } : { opacity: 0, y: 28 };
    gsap.set(items, from);
    ScrollTrigger.batch(items, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          z: 0,
          duration: reveal.duration,
          ease: reveal.ease,
          stagger: each,
          clearProps: 'opacity,transform',
        }),
    });
  }
}

function revealWords() {
  // Headings: SplitText words rise inside a mask (40ms stagger). The split happens only as
  // the heading enters, and is reverted afterwards, so the DOM text stays untouched and
  // readable before and after (§7.4, §10.3).
  const targets = [
    ...gsap.utils.toArray<HTMLElement>('main [data-reveal="words"]').filter((h) => h.tagName !== 'H1'),
  ].filter(isBelow);
  for (const h of targets) {
    ScrollTrigger.create({
      trigger: h,
      start: 'top bottom',
      once: true,
      onEnter: () => {
        const split = SplitText.create(h, { type: 'words', mask: 'words', aria: 'auto' });
        gsap.from(split.words, {
          yPercent: 100,
          duration: reveal.duration,
          ease: reveal.ease,
          stagger: stagger.words,
          onComplete: () => {
            split.revert();
            // One shimmer pass on the italic brass word of “Why live sax” (§7.4).
            if (h.id === 'why-title') {
              const em = h.querySelector('em');
              if (em) {
                em.classList.add('shimmer');
                em.addEventListener('animationend', () => em.classList.remove('shimmer'), { once: true });
              }
            }
          },
        });
      },
    });
  }

  // Pull quote: words fade in, 25ms stagger (§7.6).
  for (const q of gsap.utils.toArray<HTMLElement>('[data-reveal="fade"] blockquote p').filter(isBelow)) {
    ScrollTrigger.create({
      trigger: q,
      start: 'top bottom',
      once: true,
      onEnter: () => {
        const split = SplitText.create(q, { type: 'words', aria: 'auto' });
        gsap.from(split.words, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.025,
          onComplete: () => split.revert(),
        });
      },
    });
  }
}

function revealMarkers() {
  // Chapter markers: the line draws outward from the centre, then the label fades (§7.3).
  for (const m of gsap.utils.toArray<HTMLElement>('[data-reveal="line"]').filter(isBelow)) {
    const lines = m.querySelectorAll<HTMLElement>('.chapter__line');
    const label = m.querySelectorAll<HTMLElement>('.chapter__label, .chapter__tick');
    gsap.set(lines[0], { scaleX: 0, transformOrigin: '100% 50%' });
    gsap.set(lines[1], { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(label, { opacity: 0 });
    gsap
      .timeline({ scrollTrigger: once(m, 'top 85%') })
      .to(lines, { scaleX: 1, duration: 0.8, ease: reveal.ease })
      .to(label, { opacity: 1, duration: 0.4, ease: 'power1.out', clearProps: 'opacity' }, '-=0.3');
  }

  // PAS: the brass hairline above P3 draws (“the turn”, §7.11).
  for (const turn of gsap.utils.toArray<HTMLElement>('.pas__turn').filter(isBelow)) {
    gsap.fromTo(
      turn,
      { '--turn': 0 },
      { '--turn': 1, duration: 0.9, ease: reveal.ease, delay: 0.3, scrollTrigger: once(turn, 'top 85%') },
    );
  }
}

function scrubs() {
  const mm = gsap.matchMedia();
  // Booking steps connector draws with scroll (no pinning, §7.7).
  mm.add('(min-width: 900px)', () => {
    gsap.fromTo(
      '.steps__connector',
      { scaleX: 0, transformOrigin: '0% 50%' },
      { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 55%', scrub: 0.6 } },
    );
  });
  mm.add('(max-width: 899.98px)', () => {
    gsap.fromTo(
      '.steps__connector',
      { scaleY: 0, transformOrigin: '50% 0%' },
      { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 75%', end: 'bottom 60%', scrub: 0.6 } },
    );
  });

  // Constellation: lines from Ajah draw (stroke-dashoffset scrub, §7.9).
  const lines = gsap.utils.toArray<SVGLineElement>('.constellation__line');
  if (lines.length) {
    gsap.fromTo(
      lines,
      { strokeDasharray: 1, strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: 'none',
        stagger: 0.04,
        scrollTrigger: { trigger: '.constellation', start: 'top 80%', end: 'center 45%', scrub: 0.6 },
      },
    );
  }

  // Learning path: a brass signal travels down the line; stages ignite as it passes (§7.13).
  const flight = document.querySelector<HTMLElement>('.path__flight');
  if (flight) {
    flight.classList.add('is-scrub');
    gsap.fromTo(
      '.path__signal',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: flight, start: 'top 70%', end: 'bottom 55%', scrub: 0.5 },
      },
    );
    for (const stage of gsap.utils.toArray<HTMLElement>('.path__flight .stage')) {
      ScrollTrigger.create({
        trigger: stage,
        start: 'top 62%',
        toggleClass: { targets: stage, className: 'is-lit' },
        end: 'max',
      });
    }
  }

  // Final CTA: a wine nebula bloom rises behind the H2 (§7.17).
  gsap.fromTo(
    '.final__bloom',
    { yPercent: 30, opacity: 0.35 },
    { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: '.final', start: 'top 90%', end: 'center 55%', scrub: 0.8 } },
  );

  // Chapter tints for the cosmos (consumed by the 3D layer in M3).
  for (const el of gsap.utils.toArray<HTMLElement>('[data-chapter-tint]')) {
    ScrollTrigger.create({
      trigger: el,
      start: 'top 55%',
      end: 'bottom 55%',
      onToggle: (self) => {
        if (self.isActive) bus.tint = el.dataset.chapterTint ?? 'wine';
      },
    });
  }
}

export default function SmoothScroll() {
  // Lenis on GSAP's ticker (§10.3, pitfall 11).
  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
      anchors: { offset: -80 },
      autoRaf: false,
    });
    bus.lenis = lenis;
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.on('scroll', (l: Lenis) => {
      ScrollTrigger.update();
      bus.warp = Math.min(1, Math.abs(l.velocity) / 40);
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts.ready.then(refresh);
    const hero = document.querySelector<HTMLImageElement>('.hero__portrait img');
    if (hero && !hero.complete) hero.addEventListener('load', refresh, { once: true });

    // Path cards fire a warp burst in the cosmos (§7.2; consumed in M3).
    const onPath = (e: MouseEvent) => {
      if ((e.target as Element | null)?.closest('.path-card__link')) bus.warpBurst(600);
    };
    document.addEventListener('click', onPath);

    return () => {
      document.removeEventListener('click', onPath);
      hero?.removeEventListener('load', refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      bus.lenis = null;
    };
  }, []);

  useGSAP((context) => {
    revealGroups();
    revealMarkers();
    scrubs();
    let alive = true;
    // Word splits wait for the fonts (§10.3); added to the same context so they revert on unmount.
    document.fonts.ready.then(() => {
      if (alive) context.add(revealWords);
    });
    return () => {
      alive = false;
    };
  });

  return null;
}
