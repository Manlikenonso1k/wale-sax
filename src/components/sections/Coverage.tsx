import { site } from '@/content/site';
import { coverageParagraphs } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Chip } from '@/components/ui/Chip';
import { Constellation } from './Constellation';

export function Coverage() {
  const c = site.coverage;
  return (
    <section id="coverage" className="section coverage rails" aria-labelledby="coverage-title" data-chapter-tint="neutral">
      <div className="coverage__glow" aria-hidden="true" />
      <div className="container coverage__inner">
        <Constellation />
        <div className="coverage__copy">
          <header className="section-head">
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <SectionHeading id="coverage-title" text={c.heading} />
          </header>
          {coverageParagraphs(site).map((p) => (
            <p key={p} className="t-body">
              {p}
            </p>
          ))}
          <ul className="chips" aria-label={c.areasLabel}>
            {site.areas.map((a) => (
              <Chip as="li" key={a} dataArea={a}>
                {a}
              </Chip>
            ))}
            <Chip as="li" highlight>
              {c.moreChip}
            </Chip>
          </ul>
          <p className="note">{c.note}</p>
        </div>
      </div>
    </section>
  );
}
