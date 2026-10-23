'use client';

import { useRef } from 'react';
import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { scrollToTarget } from '@/lib/scroll-bus';
import { MotionToggle } from '@/components/layout/MotionToggle';
import { ModalShell } from './ModalShell';

/** Mobile Sheet (§9.7): the four section links, Message Wale and the Motion toggle. */
export function MobileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pending = useRef<string | null>(null);

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={site.ui.menu}
      mode="sheet"
      className="sheet"
      onClosed={() => {
        const target = pending.current;
        pending.current = null;
        if (!target) return false;
        // Close first, then scroll to the section (§9.7); focus lands on the section heading.
        scrollToTarget(target);
        const heading = document.querySelector<HTMLElement>(`${target} h2`);
        if (heading) {
          heading.setAttribute('tabindex', '-1');
          heading.focus({ preventScroll: true });
        }
        if (history.replaceState) history.replaceState(null, '', target);
        return true;
      }}
    >
      <nav aria-label={site.nav.label}>
        <ul className="sheet__links">
          {site.nav.links.map((l, i) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="sheet__link"
                data-autofocus={i === 0 ? '' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  pending.current = l.href;
                  onClose();
                }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="sheet__foot">
        <a className="btn btn--primary btn--m press" href={defaultLinks.general} target="_blank" rel="noopener">
          <span>{site.nav.cta}</span>
        </a>
        <MotionToggle label={site.ui.motionLabel} on={site.ui.motionOn} off={site.ui.motionOff} variant="sheet" />
      </div>
    </ModalShell>
  );
}
