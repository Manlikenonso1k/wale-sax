import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function LessonsPath() {
  const p = site.lessonsPath;
  return (
    <section id="lessons-path" className="section" aria-labelledby="path-title">
      <div className="container path">
        <header className="section-head path__head">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <SectionHeading id="path-title" text={p.heading} />
          <p className="t-lead">{p.intro}</p>
        </header>
        <div className="path__flight">
          <span className="path__line" aria-hidden="true" />
          <span className="path__signal" aria-hidden="true" data-scrub="signal" />
          <ol className="path__stages">
            {p.stages.map((s) => (
              <li key={s.n} className="stage">
                <span className="stage__node" aria-hidden="true" />
                <span className="t-num-sm" aria-hidden="true">
                  {s.n}
                </span>
                <h3 className="t-h3">{s.title}</h3>
                <p className="t-card-body">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
