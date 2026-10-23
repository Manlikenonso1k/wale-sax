/**
 * Which overlay is open, what opened it, and where it should grow from (§9.1).
 * Tiny external store so first-load code can open overlays from the deferred OverlayHost.
 */
import { useSyncExternalStore } from 'react';

export type OverlayKind = 'booking' | 'lessons' | 'lightbox' | 'sheet';

export type OverlayState = {
  open: OverlayKind | null;
  trigger: HTMLElement | null;
  originRect: DOMRect | null;
  lightboxIndex: number;
};

let state: OverlayState = { open: null, trigger: null, originRect: null, lightboxIndex: 0 };
const listeners = new Set<() => void>();
const SERVER: OverlayState = state;

export function getOverlay() {
  return state;
}

export function setOverlay(patch: Partial<OverlayState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

export function openOverlay(open: OverlayKind, trigger: HTMLElement | null, lightboxIndex = 0) {
  setOverlay({ open, trigger, originRect: trigger?.getBoundingClientRect() ?? null, lightboxIndex });
}

export function closeOverlay() {
  setOverlay({ open: null });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useOverlay(): OverlayState {
  return useSyncExternalStore(subscribe, getOverlay, () => SERVER);
}
