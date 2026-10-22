import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';

/** Host or student testimonials. Placeholder cards get a dashed brass border (§6.1). No carousel. */
export function Testimonials({ id }: { id: 'hosts' | 'students' }) {
  const t = site[id];
  return (
    <section id={id} className="section" aria-labelledby={`${id}-title`}>
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{t.eyebrow}</Eyebrow>
          <SectionHeading id={`${id}-title`} text={t.heading} />
        </header>
        <ul className="testimonials" data-reveal="float" data-stagger="100">
          {t.cards.map((c, i) => (
            <li key={i}>
              <figure className={`panel testimonial ${c.placeholder ? 'is-placeholder' : ''}`.trim()}>
                <blockquote className="t-quote">
                  <p>{c.quote}</p>
                </blockquote>
                <figcaption className="testimonial__by">
                  <span className="testimonial__name">{c.name}</span>
                  <span className="testimonial__meta">{c.meta}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
