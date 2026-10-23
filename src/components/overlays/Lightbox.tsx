'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { animate, motion, useMotionValue } from 'motion/react';
import { site } from '@/content/site';
import { galleryCounter } from '@/content/derive';
import { springs, fadeOff } from '@/lib/motion-tokens';
import { useMotionEnabled } from '@/lib/motion-preference';
import { getOverlay } from '@/lib/overlay-store';
import { bus } from '@/lib/scroll-bus';
import { Icon } from '@/components/ui/Icon';
import { HudFrame } from '@/components/ui/HudFrame';
import { project } from './ModalShell';
import type { LightboxItem } from './types';

type Props = { index: number; items: LightboxItem[]; onClose: () => void };

const tileFor = (i: number) => document.querySelector<HTMLElement>(`[data-lightbox-index="${i}"]`);

/**
 * Lightbox (§9.5). Opens from the clicked tile's rect (FLIP) and closes back into it.
 * ←/→ navigate, Esc closes, swipe left/right navigates, drag down dismisses
 * (1:1, rubber-band upward, dismiss past 30% of the viewport or faster than 800px/s).
 */
/** Mounted only while open (OverlayHost); runs its exit animation, then calls onClose. */
export function Lightbox({ index, items, onClose }: Props) {
  const motionOn = useMotionEnabled() !== false;
  const [current, setCurrent] = useState(index);
  const mediaRef = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const scale = useMotionValue(1);
  const fade = useMotionValue(1);
  const n = items.length;
  const item = items[current] ?? items[0];

  useEffect(() => {
    bus.dim = 1;
    return () => {
      bus.dim = 0;
    };
  }, []);

  // FLIP in: from the tile rect to the centred fit.
  useLayoutEffect(() => {
    if (!mediaRef.current) return;
    closing.current = false;
    const to = mediaRef.current.getBoundingClientRect();
    const from = getOverlay().originRect;
    if (!motionOn || !from || !to.width) {
      fade.set(0);
      animate(fade, 1, fadeOff);
      return;
    }
    const s = from.width / to.width;
    x.set(from.left + from.width / 2 - (to.left + to.width / 2));
    y.set(from.top + from.height / 2 - (to.top + to.height / 2));
    scale.set(s);
    fade.set(0.4);
    animate(x, 0, springs.ui);
    animate(y, 0, springs.ui);
    animate(scale, 1, springs.ui);
    animate(fade, 1, { duration: 0.2 });
    // Only on open; navigation has its own transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = onClose;

  // FLIP out: back into the current item's tile (re-measured).
  const requestClose = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    const el = mediaRef.current;
    const tile = tileFor(current);
    if (!motionOn || !el || !tile) {
      animate(fade, 0, fadeOff).then(finish);
      return;
    }
    const to = tile.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    const baseW = box.width / scale.get();
    const baseL = box.left + box.width / 2 - x.get();
    const baseT = box.top + box.height / 2 - y.get();
    animate(x, to.left + to.width / 2 - baseL, springs.ui);
    animate(y, to.top + to.height / 2 - baseT, springs.ui);
    animate(scale, to.width / baseW, springs.ui);
    animate(fade, 0, { duration: 0.3, delay: 0.1 }).then(finish);
  }, [current, motionOn, fade, x, y, scale, finish]);

  const go = useCallback(
    (dir: 1 | -1) => {
      setCurrent((c) => (c + dir + n) % n);
      x.set(0);
      y.set(0);
      if (motionOn) {
        fade.set(0.3);
        animate(fade, 1, { duration: 0.25 });
      }
    },
    [n, motionOn, fade, x, y],
  );

  // Touch / pointer gestures on the media stage.
  const gesture = useRef<{ id: number; x0: number; y0: number; axis: 'x' | 'y' | null; samples: { t: number; x: number; y: number }[] } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    gesture.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, axis: null, samples: [{ t: e.timeStamp, x: e.clientX, y: e.clientY }] };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const dx = e.clientX - g.x0;
    const dy = e.clientY - g.y0;
    if (!g.axis) {
      if (Math.hypot(dx, dy) < 6) return;
      g.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    g.samples.push({ t: e.timeStamp, x: e.clientX, y: e.clientY });
    g.samples = g.samples.filter((s) => e.timeStamp - s.t < 100);
    if (g.axis === 'x') x.set(dx);
    else y.set(dy > 0 ? dy : dy * 0.35);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g || !g.axis) return;
    const first = g.samples[0];
    const last = g.samples[g.samples.length - 1];
    const dt = Math.max(1, last.t - first.t);
    const vx = ((last.x - first.x) / dt) * 1000;
    const vy = ((last.y - first.y) / dt) * 1000;
    if (g.axis === 'x') {
      const p = project(e.clientX - g.x0, vx);
      if (n > 1 && Math.abs(p) > window.innerWidth * 0.25) go(p < 0 ? 1 : -1);
      else animate(x, 0, springs.sheet);
    } else {
      const dy = e.clientY - g.y0;
      if (dy > 0 && (project(dy, vy) > window.innerHeight * 0.3 || vy > 800)) requestClose();
      else animate(y, 0, springs.sheet);
    }
  };

  if (!item) return null;
  const counter = galleryCounter(site, current);

  return (
    <Dialog.Root open onOpenChange={(o) => !o && requestClose()}>
      {(
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <motion.div className="lightbox__scrim" style={{ opacity: fade }} />
          </Dialog.Overlay>
          <Dialog.Content
            className="lightbox"
            aria-describedby={undefined}
            onEscapeKeyDown={(e) => {
              e.preventDefault();
              requestClose();
            }}
            onPointerDownOutside={(e) => e.preventDefault()}
            onOpenAutoFocus={(e) => {
              e.preventDefault();
              (document.querySelector<HTMLElement>(n > 1 ? '.lightbox [data-next]' : '.lightbox__close') ?? null)?.focus();
            }}
            onCloseAutoFocus={(e) => {
              e.preventDefault();
              (tileFor(current) ?? getOverlay().trigger)?.focus({ preventScroll: true });
            }}
            onKeyDown={(e) => {
              if (n < 2) return;
              if (e.key === 'ArrowRight') go(1);
              if (e.key === 'ArrowLeft') go(-1);
            }}
          >
            <Dialog.Title className="sr-only">{`${site.lightbox.label}: ${item.alt}`}</Dialog.Title>
            <div
              className="lightbox__stage"
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={(e) => {
                if (e.target === e.currentTarget) requestClose();
              }}
            >
              <motion.div ref={mediaRef} className="lightbox__media" style={{ x, y, scale, opacity: fade }}>
                <HudFrame leg={16} className="lightbox__frame">
                  {item.videoSrc ? (
                    <video className="lightbox__video" controls playsInline preload="none" poster={item.webp || item.src} src={item.videoSrc} aria-label={item.alt} />
                  ) : (
                    <picture>
                      {item.avif && <source type="image/avif" srcSet={item.avif} />}
                      {item.webp && <source type="image/webp" srcSet={item.webp} />}
                      <img className="lightbox__img" src={item.src} alt={item.alt} width={item.width} height={item.height} draggable={false} />
                    </picture>
                  )}
                </HudFrame>
              </motion.div>
            </div>
            <motion.div className="lightbox__hud" style={{ opacity: fade }}>
              <div className="lightbox__meta">
                <p className="lightbox__counter" aria-live="polite">
                  {counter}
                </p>
                <p className="lightbox__caption">{item.caption}</p>
                {item.externalUrl && item.externalKind && (
                  <a className="btn btn--outline btn--s press" href={item.externalUrl} target="_blank" rel="noopener">
                    <Icon name="play" size={14} />
                    <span>{item.externalKind === 'instagram' ? site.lightbox.watchOnInstagram : site.lightbox.watchOnYouTube}</span>
                  </a>
                )}
              </div>
              {n > 1 && (
                <div className="lightbox__nav">
                  <button type="button" className="lightbox__btn press" aria-label={site.lightbox.prev} onClick={() => go(-1)}>
                    <Icon name="chevron-left" size={20} />
                  </button>
                  <button type="button" className="lightbox__btn press" aria-label={site.lightbox.next} onClick={() => go(1)} data-next>
                    <Icon name="chevron-right" size={20} />
                  </button>
                </div>
              )}
            </motion.div>
            <button type="button" className="lightbox__close press" aria-label={site.lightbox.close} onClick={requestClose}>
              <Icon name="close" size={20} />
            </button>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
  );
}
