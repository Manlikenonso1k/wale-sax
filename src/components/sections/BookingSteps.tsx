import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Chip } from '@/components/ui/Chip';

export function BookingSteps() {
  const b = site.bookingSteps;
  return (
    <section id="booking-steps" className="section" aria-labelledby="steps-title">
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{b.eyebrow}</Eyebrow>
          <SectionHeading id="steps-title" text={b.heading} />
        </header>
        <div className="steps">
          <span className="steps__connector" aria-hidden="true" data-scrub="connector" />
          <ol className="steps__list">
            {b.steps.map((s) => (
              <li key={s.n} className="panel step">
                <span className="t-num-lg" aria-hidden="true">
                  {s.n}
                </span>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-card-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="genres">
          <p className="t-caption genres__label" id="genres-label">
            {b.genresLabel}
          </p>
          <ul className="chips" aria-labelledby="genres-label">
            {site.performance.genres.map((g) => (
              <Chip as="li" key={g}>
                {g}
              </Chip>
            ))}
            <Chip as="li" highlight>
              {b.yourSong}
            </Chip>
          </ul>
        </div>
      </div>
    </section>
  );
}
