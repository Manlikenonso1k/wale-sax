import { useSyncExternalStore } from 'react';

const noop = () => () => {};

/** false during SSR and hydration, true after (no setState-in-effect). */
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

/** Plain primary click (no modifier keys): safe to enhance instead of following the link. */
export function isPlainClick(e: MouseEvent | React.MouseEvent): boolean {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
