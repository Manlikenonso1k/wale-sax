'use client';

import { useEffect } from 'react';
import { closeOverlay, useOverlay } from '@/lib/overlay-store';
import { bus } from '@/lib/scroll-bus';
import { BookingConsole } from './BookingConsole';
import { LessonsConsole } from './LessonsConsole';
import { MobileSheet } from './MobileSheet';
import { Lightbox } from './Lightbox';
import type { LightboxItem } from './types';

/**
 * Deferred overlay chunk (PLAN OQ-1): Radix + Motion, loaded after hydration on idle or on
 * first intent. Marks html[data-overlays="ready"]; until then every CTA is a plain wa.me link.
 * Stops Lenis while any modal is open (§9.1, pitfall 16).
 */
export default function OverlayHost({ gallery }: { gallery: LightboxItem[] }) {
  const s = useOverlay();

  useEffect(() => {
    document.documentElement.setAttribute('data-overlays', 'ready');
    return () => document.documentElement.removeAttribute('data-overlays');
  }, []);

  useEffect(() => {
    if (s.open) bus.lenis?.stop();
    else bus.lenis?.start();
  }, [s.open]);

  return (
    <>
      <BookingConsole open={s.open === 'booking'} onClose={closeOverlay} />
      <LessonsConsole open={s.open === 'lessons'} onClose={closeOverlay} />
      <MobileSheet open={s.open === 'sheet'} onClose={closeOverlay} />
      {s.open === 'lightbox' && gallery.length > 0 && <Lightbox index={s.lightboxIndex} items={gallery} onClose={closeOverlay} />}
    </>
  );
}
