'use client';

/**
 * Desktop effects (§10.5), loaded only for `pointer: fine` with motion on:
 * tilt (≤ data-tilt-max degrees), pointer-following sheen and spotlights (CSS vars),
 * magnetic CTAs (≤ 6px toward the pointer within 1.2× radius), and a decorative cursor
 * follower ring. The native cursor stays visible. Everything is removed on unmount.
 */
import { useEffect } from 'react';

const INTERACTIVE = 'a, button, input, label, select, textarea, [role="switch"]';

export default function FxLayer() {
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute('data-fx', 'on');
    const offs: (() => void)[] = [];
    const on = <K extends keyof HTMLElementEventMap>(el: HTMLElement | Window, type: K, fn: (e: HTMLElementEventMap[K]) => void) => {
      el.addEventListener(type, fn as EventListener, { passive: true });
      offs.push(() => el.removeEventListener(type, fn as EventListener));
    };

    // Tilt + sheen + spotlight: pointer position as CSS variables, tilt as a transform.
    for (const el of Array.from(document.querySelectorAll<HTMLElement>('[data-fx~="tilt"], [data-fx~="spotlight"], [data-fx~="sheen"]'))) {
      const tilt = el.matches('[data-fx~="tilt"]');
      const max = Number(el.dataset.tiltMax ?? 6);
      on(el, 'pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        if (tilt) {
          el.classList.add('is-tilting');
          el.style.transform = `perspective(1200px) rotateX(${((0.5 - py) * 2 * max).toFixed(2)}deg) rotateY(${((px - 0.5) * 2 * max).toFixed(2)}deg)`;
        }
      });
      on(el, 'pointerleave', () => {
        el.classList.remove('is-tilting');
        if (tilt) el.style.transform = '';
      });
      offs.push(() => {
        el.style.transform = '';
        el.style.removeProperty('--mx');
        el.style.removeProperty('--my');
        el.classList.remove('is-tilting');
      });
    }

    // Magnetic CTAs.
    const magnets = Array.from(document.querySelectorAll<HTMLElement>('[data-fx~="magnetic"]'));
    on(window, 'pointermove', (e) => {
      for (const m of magnets) {
        const r = m.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const radius = (Math.max(r.width, r.height) / 2) * 1.2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const d = Math.hypot(dx, dy);
        if (d < radius) {
          const k = 6 / radius;
          m.style.translate = `${(dx * k).toFixed(2)}px ${(dy * k).toFixed(2)}px`;
        } else if (m.style.translate) m.style.translate = '';
      }
    });
    offs.push(() => magnets.forEach((m) => (m.style.translate = '')));

    // Cursor follower (decorative, aria-hidden). Critically damped spring toward the pointer.
    const ring = document.createElement('div');
    ring.className = 'cursor-follower';
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    let tx = -100;
    let ty = -100;
    let x = tx;
    let y = ty;
    let vx = 0;
    let vy = 0;
    let raf = 0;
    let last = performance.now();
    const k = 420; // stiffness
    const c = 2 * Math.sqrt(k); // critical damping
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      vx += (k * (tx - x) - c * vx) * dt;
      vy += (k * (ty - y) - c * vy) * dt;
      x += vx * dt;
      y += vy * dt;
      ring.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    on(window, 'pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      tx = e.clientX;
      ty = e.clientY;
      ring.classList.add('is-visible');
      const hot = (e.target as Element | null)?.closest?.(INTERACTIVE);
      ring.classList.toggle('is-hot', Boolean(hot));
    });
    const hide = () => ring.classList.remove('is-visible');
    document.addEventListener('pointerleave', hide);
    offs.push(() => {
      document.removeEventListener('pointerleave', hide);
      cancelAnimationFrame(raf);
      ring.remove();
    });

    return () => {
      offs.forEach((f) => f());
      html.removeAttribute('data-fx');
    };
  }, []);

  return null;
}
