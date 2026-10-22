import { site } from '@/content/site';
import { faqItems } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';

/**
 * FAQ (§6.10). M1: every answer is rendered open (readable without JS).
 * M2 turns each question into an accordion button that collapses after hydration.
 */
export function Faq() {
  const f = site.faq;
  return (
    <section id="faq" className="section" aria-labelledby="faq-title" data-chapter-tint="dim">
      <div className="container faq">
        <header className="section-head">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <SectionHeading id="faq-title" text={f.heading} />
        </header>
        {faqItems(site).map((g) => (
          <div key={g.id} className="faq__group">
            <h3 className="t-caption faq__group-label" id={`faq-group-${g.id}`}>
              {g.label}
            </h3>
            <ul className="faq__list" aria-labelledby={`faq-group-${g.id}`}>
              {g.items.map((it) => (
                <li key={it.id} className="faq__item">
                  <h4 className="t-faq-q faq__q" id={`${it.id}-q`}>
                    <span>{it.q}</span>
                    <Icon name="plus" size={20} strokeWidth={1.8} className="faq__plus" />
                  </h4>
                  <div className="faq__a" id={`${it.id}-a`} role="region" aria-labelledby={`${it.id}-q`}>
                    <p>{it.a}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
