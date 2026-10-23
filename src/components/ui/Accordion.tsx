'use client';

import { useState, type ReactNode } from 'react';
import { useMounted } from '@/lib/use-mounted';

export type AccordionItem = { id: string; q: string; a: string };

/**
 * FAQ accordion (§7.16): <h4><button aria-expanded aria-controls> + labelled region.
 * Server-rendered open (readable without JS); collapses after hydration. Several may be open.
 */
export function Accordion({ items, icon }: { items: AccordionItem[]; icon: ReactNode }) {
  const mounted = useMounted();
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());
  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <ul className="faq__list" data-ready={mounted ? 'true' : undefined}>
      {items.map((it) => {
        const open = !mounted || openIds.has(it.id);
        const state = open ? 'open' : 'closed';
        return (
          <li key={it.id} className="faq__item" data-state={state}>
            <h4 className="t-faq-q faq__q">
              <button
                type="button"
                id={`${it.id}-q`}
                className="faq__button"
                aria-expanded={open}
                aria-controls={`${it.id}-a`}
                onClick={() => toggle(it.id)}
              >
                <span>{it.q}</span>
                <span className="faq__plus">{icon}</span>
              </button>
            </h4>
            <div
              className="faq__a"
              id={`${it.id}-a`}
              role="region"
              aria-labelledby={`${it.id}-q`}
              data-state={state}
              inert={!open}
            >
              <div className="faq__a-inner">
                <p>{it.a}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
