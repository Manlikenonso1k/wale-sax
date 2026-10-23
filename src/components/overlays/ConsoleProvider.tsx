'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { openOverlay, type OverlayKind } from '@/lib/overlay-store';
import { isPlainClick } from '@/lib/use-mounted';
import { onIdle } from '@/components/providers/MotionProvider';
import type { LightboxItem } from './types';

type HostProps = { gallery: LightboxItem[] };
let hostPromise: Promise<ComponentType<HostProps>> | null = null;
const loadHost = () => (hostPromise ??= import('./OverlayHost').then((m) => m.default));
const ready = () => document.documentElement.getAttribute('data-overlays') === 'ready';

/**
 * One delegated click listener for every console CTA, the Menu button and gallery tiles
 * (PLAN §7). Until the deferred OverlayHost has loaded (html[data-overlays="ready"]),
 * CTAs stay plain wa.me links (M-07) and Menu uses its CSS fallback.
 */
export function ConsoleProvider({ gallery }: HostProps) {
  const [Host, setHost] = useState<ComponentType<HostProps> | null>(null);

  useEffect(() => {
    const load = () => loadHost().then((C) => setHost(() => C));
    const cancel = onIdle(load);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || !isPlainClick(e)) return;
      const el = (e.target as Element | null)?.closest<HTMLElement>('a[data-console], [data-open="sheet"], [data-lightbox-index]');
      if (!el) return;
      let kind: OverlayKind;
      let index = 0;
      if (el.matches('[data-lightbox-index]')) {
        kind = 'lightbox';
        index = Number(el.getAttribute('data-lightbox-index')) || 0;
        e.preventDefault();
        if (!ready()) {
          // Tiles have no native fallback: load, then open.
          load().then(() => requestAnimationFrame(() => openOverlay(kind, el, index)));
          return;
        }
      } else if (el.matches('[data-open="sheet"]')) {
        kind = 'sheet';
        if (!ready()) return; // CSS :target menu works without the host
        e.preventDefault();
      } else {
        const c = el.getAttribute('data-console');
        if (c !== 'booking' && c !== 'lessons') return; // “contact” is the nav popover
        kind = c;
        if (!ready()) return; // the wa.me link opens WhatsApp directly
        e.preventDefault();
      }
      openOverlay(kind, el, index);
    };

    // Prefetch on first intent.
    const intent = (e: Event) => {
      if ((e.target as Element | null)?.closest?.('[data-console], [data-open], [data-lightbox-index]')) load();
    };

    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', intent, { passive: true });
    document.addEventListener('focusin', intent);
    document.addEventListener('touchstart', intent, { passive: true });
    return () => {
      cancel();
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', intent);
      document.removeEventListener('focusin', intent);
      document.removeEventListener('touchstart', intent);
    };
  }, []);

  return Host ? <Host gallery={gallery} /> : null;
}
