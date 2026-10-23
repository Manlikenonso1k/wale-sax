import { site } from '@/content/site';
import { faqItems } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { Accordion } from '@/components/ui/Accordion';

/**
 * FAQ (§6.10, §7.16): two labelled groups of accordions. Answers are server-rendered open
 * (readable without JS) and collapse after hydration.
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
          <div key={g.id} className="faq__group" role="group" aria-labelledby={`faq-group-${g.id}`}>
            <h3 className="t-caption faq__group-label" id={`faq-group-${g.id}`}>
              {g.label}
            </h3>
            <Accordion items={g.items} icon={<Icon name="plus" size={20} strokeWidth={1.8} />} />
          </div>
        ))}
      </div>
    </section>
  );
}
