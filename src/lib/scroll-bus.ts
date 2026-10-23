/**
 * Shared, mutable handles between the deferred layers (no React, no imports of the
 * libraries themselves, so first-load code stays small).
 *  - `lenis`: the Lenis instance while SmoothScroll is mounted (OverlayHost stops/starts it).
 *  - cosmos uniforms (`warp`, `tint`, `dim`): written by DOM code, read by the 3D loop in M3.
 */
type LenisLike = {
  stop: () => void;
  start: () => void;
  scrollTo: (target: string | number | HTMLElement, opts?: { offset?: number; immediate?: boolean }) => void;
};

export const bus = {
  lenis: null as LenisLike | null,
  warp: 0,
  warpUntil: 0,
  tint: 'wine' as string,
  dim: 0,
  audio: 0,
  warpBurst(ms = 600) {
    this.warpUntil = performance.now() + ms;
  },
};

/** Scroll to an element by selector: Lenis when active, native otherwise. */
export function scrollToTarget(selector: string) {
  const el = document.querySelector<HTMLElement>(selector);
  if (!el) return;
  if (bus.lenis) bus.lenis.scrollTo(el, { offset: -80 });
  else el.scrollIntoView({ block: 'start' });
}
