'use client';

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { isPlainClick, useMounted } from '@/lib/use-mounted';

export type ContactOption = { kind: string; label: string; href: string; icon: ReactNode };

type Props = {
  variant: 'widget' | 'menu';
  href: string;
  triggerClassName: string;
  triggerContent: ReactNode;
  ariaLabel?: string;
  panelLabel: string;
  title?: string;
  status?: string;
  closeLabel: string;
  closeIcon: ReactNode;
  options: ContactOption[];
  dataWidget?: boolean;
};

type Phase = 'closed' | 'open' | 'closing';

/**
 * Anchored disclosure popover (§9.1, §9.4): the nav Contact Menu and the WhatsApp widget panel.
 * The trigger is always a real wa.me link (M-07, OQ-12); JS turns a plain click into “open the panel”.
 * Esc closes, click outside closes, focus moves in on open and back to the trigger on close.
 */
export function ContactPopover(p: Props) {
  const mounted = useMounted();
  const [phase, setPhase] = useState<Phase>('closed');
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const open = phase === 'open';

  const close = useCallback((returnFocus: boolean) => {
    setPhase((ph) => (ph === 'open' ? 'closing' : ph));
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  // Finish the exit animation, then unmount the panel.
  useEffect(() => {
    if (phase !== 'closing') return;
    const t = window.setTimeout(() => setPhase('closed'), 240);
    return () => window.clearTimeout(t);
  }, [phase]);

  // Focus the first option when the panel opens.
  useEffect(() => {
    if (phase === 'open') panelRef.current?.querySelector<HTMLElement>('a')?.focus();
  }, [phase]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        close(true);
      }
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close(false);
    };
    const onFocus = (e: FocusEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('focusin', onFocus);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('focusin', onFocus);
    };
  }, [open, close]);

  const onTriggerClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(e)) return; // modifier clicks still open WhatsApp directly
    e.preventDefault();
    if (open) close(false);
    else setPhase('open');
  };

  return (
    <div ref={wrapRef} className={`popover popover--${p.variant}`} data-state={phase === 'closed' ? 'closed' : phase}>
      <a
        ref={triggerRef}
        href={p.href}
        target="_blank"
        rel="noopener"
        className={p.triggerClassName}
        aria-label={p.ariaLabel}
        aria-expanded={mounted ? open : undefined}
        aria-controls={mounted && phase !== 'closed' ? panelId : undefined}
        onClick={onTriggerClick}
        data-widget={p.dataWidget ? 'true' : undefined}
      >
        {p.triggerContent}
      </a>
      {phase !== 'closed' && (
        <div id={panelId} ref={panelRef} role="group" aria-label={p.panelLabel} className="popover__panel" data-state={phase}>
          {p.title && (
            <div className="popover__head">
              <p className="popover__title">{p.title}</p>
              {p.status && (
                <p className="popover__status">
                  <span className="popover__status-dot" aria-hidden="true" />
                  {p.status}
                </p>
              )}
            </div>
          )}
          <ul className="popover__options">
            {p.options.map((o, i) => (
              <li key={o.kind} style={{ ['--i' as string]: i }}>
                <a className="popover__option press" href={o.href} target="_blank" rel="noopener" onClick={() => close(false)}>
                  <span className="popover__icon">{o.icon}</span>
                  <span>{o.label}</span>
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="popover__close press" aria-label={p.closeLabel} onClick={() => close(true)}>
            {p.closeIcon}
          </button>
        </div>
      )}
    </div>
  );
}
