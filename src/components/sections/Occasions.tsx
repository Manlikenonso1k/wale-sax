import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Picture } from '@/components/ui/Picture';
import { Button } from '@/components/ui/Button';

export function Occasions() {
  const o = site.occasions;
  return (
    <section id="occasions" className="section" aria-labelledby="occasions-title">
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{o.eyebrow}</Eyebrow>
          <SectionHeading id="occasions-title" text={o.heading} />
        </header>
        <ul className="occasions__grid" data-reveal="rise" data-stagger="90">
          {o.cards.map((c) => (
            <li key={c.image}>
              <article className="occasion" data-fx="spotlight">
                <div className="occasion__media">
                  <Picture
                    name={c.image}
                    alt={c.alt}
                    sizes="(min-width: 1100px) 270px, (min-width: 600px) 50vw, 100vw"
                  />
                </div>
                <h3 className="t-card-title">{c.title}</h3>
                <p className="t-card-body">{c.body}</p>
              </article>
            </li>
          ))}
        </ul>
        <div className="occasions__footer">
          <p className="t-body occasions__more">{o.footer}</p>
          <Button href={defaultLinks.booking} variant="outline" size="M" console="booking">
            {o.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
