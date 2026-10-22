import type { ReactNode } from 'react';

/** Marks children for the magnetic effect (wired up by FxLayer in M2). */
export function Magnetic({ children }: { children: ReactNode }) {
  return <span className="magnetic" data-fx="magnetic">{children}</span>;
}
