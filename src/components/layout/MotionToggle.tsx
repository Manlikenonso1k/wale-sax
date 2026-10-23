'use client';

import { setMotionEnabled, useMotionEnabled } from '@/lib/motion-preference';

type Props = { label: string; on: string; off: string; variant?: 'footer' | 'sheet' };

/** Visible Motion on/off switch (M-13, WCAG 2.2.2). Rendered only after mount (needs JS). */
export function MotionToggle({ label, on, off, variant = 'footer' }: Props) {
  const enabled = useMotionEnabled();
  if (enabled === null) return null;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      className={`motion-toggle motion-toggle--${variant} press`}
      onClick={() => setMotionEnabled(!enabled)}
      data-motion-toggle
    >
      <span>{label}:</span> <span className="motion-toggle__state">{enabled ? on : off}</span>
      <span className="motion-toggle__track" aria-hidden="true">
        <span className="motion-toggle__thumb" />
      </span>
    </button>
  );
}
