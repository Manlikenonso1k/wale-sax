import { site } from '@/content/site';
import { lessonFormats } from '@/content/derive';
import { defaultLinks } from '@/lib/whatsapp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

export function LessonsFormats() {
  const f = site.lessonsFormats;
  const cards = lessonFormats(site);
  return (
    <section id="lessons-formats" className="section" aria-labelledby="formats-title">
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <SectionHeading id="formats-title" text={f.heading} />
        </header>
        <ul className={`formats__grid ${cards.length === 1 ? 'is-single' : ''}`.trim()} data-reveal="rise" data-stagger="90">
          {cards.map((c) => (
            <li key={c.key} className="panel format-card">
              <h3 className="t-card-title">{c.title}</h3>
              <p className="t-card-body">{c.body}</p>
              <p className="format-card__price">{c.price}</p>
            </li>
          ))}
        </ul>
        <div className="formats__footer">
          {site.lessons.advisesOnInstruments && <p className="t-body formats__note">{f.instrumentNote}</p>}
          <Button href={defaultLinks.lessons} size="L" console="lessons">
            {f.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
