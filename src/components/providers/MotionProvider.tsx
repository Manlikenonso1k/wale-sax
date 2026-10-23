'use client';

import { useEffect, useState, type ComponentType } from 'react';
import { applyAttribute, useMotionEnabled } from '@/lib/motion-preference';

type Loaded = { SmoothScroll?: ComponentType; FxLayer?: ComponentType };

/** Run after hydration when the browser is idle (fallback 1200ms). */
export function onIdle(cb: () => void): () => void {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(cb, { timeout: 2000 });
    return () => window.cancelIdleCallback(id);
  }
  const t = setTimeout(cb, 1200);
  return () => clearTimeout(t);
}

/**
 * Motion layer loader (PLAN OQ-1): after hydration and idle, loads the deferred
 * SmoothScroll chunk (Lenis + GSAP + reveals) when motion is on, and FxLayer
 * (tilt, sheen, spotlight, magnetic, cursor) for fine pointers. Nothing loads when motion is off.
 */
export function MotionProvider() {
  const motion = useMotionEnabled();
  const [mods, setMods] = useState<Loaded>({});
  const [fine, setFine] = useState(false);

  useEffect(() => {
    applyAttribute();
  }, [motion]);

  useEffect(() => {
    if (!motion) return;
    let alive = true;
    const cancel = onIdle(() => {
      const mq = window.matchMedia('(pointer: fine)');
      import('./SmoothScroll').then((m) => alive && setMods((s) => ({ ...s, SmoothScroll: m.default })));
      if (mq.matches) {
        import('./FxLayer').then((m) => {
          if (!alive) return;
          setFine(true);
          setMods((s) => ({ ...s, FxLayer: m.default }));
        });
      }
    });
    return () => {
      alive = false;
      cancel();
    };
  }, [motion]);

  if (!motion) return null;
  const { SmoothScroll, FxLayer } = mods;
  return (
    <>
      {SmoothScroll && <SmoothScroll />}
      {fine && FxLayer && <FxLayer />}
    </>
  );
}
