'use client';

import { useEffect } from 'react';

/**
 * Sticky nav behaviour (§7.18): hides on scroll-down after 400px, reappears on scroll-up
 * (transform only). CSS keeps it visible while focus is inside it (:focus-within).
 */
export function NavController() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('header.nav[data-nav]');
    if (!nav) return;
    let last = window.scrollY;
    let ticking = false;
    const update = () => {
      ticking = false;
      const y = window.scrollY;
      if (y > 400 && y > last + 4) nav.classList.add('nav--hidden');
      else if (y < last - 4 || y <= 400) nav.classList.remove('nav--hidden');
      last = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return null;
}
