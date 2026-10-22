import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function WhyLive() {
  const w = site.why;
  return (
    <section id="why" className="section" aria-labelledby="why-title">
      <div className="container why">
        <div className="why__top">
          <header className="section-head">
            <Eyebrow>{w.eyebrow}</Eyebrow>
            <SectionHeading id="why-title" text={w.heading} />
          </header>
          <div className="why__copy">
            <p className="t-body">{w.body}</p>
            <p className="t-emph">{w.emphasis}</p>
          </div>
        </div>
        <ul className="features" data-reveal="rise" data-stagger="90">
          {w.features.map((f) => (
            <li key={f.n} className="feature">
              <span className="t-num-sm" aria-hidden="true">
                {f.n}
              </span>
              <h3 className="t-h3">{f.title}</h3>
              <p className="t-card-body">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
