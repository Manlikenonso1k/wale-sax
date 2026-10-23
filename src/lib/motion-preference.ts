/**
 * Motion preference store (§10.4): OS `prefers-reduced-motion` combined with the
 * user's Motion toggle (localStorage `wale-motion`). Read with useSyncExternalStore.
 */
import { useSyncExternalStore } from 'react';

const KEY = 'wale-motion';
type Pref = 'on' | 'off' | null;

const listeners = new Set<() => void>();
let userPref: Pref | undefined;
let mq: MediaQueryList | null = null;

function readPref(): Pref {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'on' || v === 'off' ? v : null;
  } catch {
    return null;
  }
}

function ensure() {
  if (typeof window === 'undefined' || mq) return;
  userPref = readPref();
  mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', emit);
}

function emit() {
  applyAttribute();
  listeners.forEach((l) => l());
}

/** true = motion on. */
export function getMotionEnabled(): boolean {
  ensure();
  if (userPref === 'on') return true;
  if (userPref === 'off') return false;
  return !(mq?.matches ?? false);
}

/** Keeps html[data-motion] in sync (the inline head script sets “off” before first paint). */
export function applyAttribute() {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-motion', getMotionEnabled() ? 'on' : 'off');
}

export function setMotionEnabled(on: boolean) {
  ensure();
  userPref = on ? 'on' : 'off';
  try {
    localStorage.setItem(KEY, userPref);
  } catch {
    /* storage unavailable: keep the in-memory choice */
  }
  emit();
}

function subscribe(cb: () => void) {
  ensure();
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** `null` during SSR and hydration; boolean after mount. */
export function useMotionEnabled(): boolean | null {
  return useSyncExternalStore<boolean | null>(subscribe, getMotionEnabled, () => null);
}
