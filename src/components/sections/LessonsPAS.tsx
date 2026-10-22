import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';

export function LessonsPAS() {
  const p = site.lessonsPas;
  return (
    <section id="lessons-why" className="section" aria-labelledby="pas-title">
      <div className="container pas">
        <header className="section-head section-head--center">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <SectionHeading id="pas-title" text={p.heading} />
        </header>
        <div className="pas__copy" data-reveal="rise" data-stagger="160">
          <p className="t-body">{p.p1}</p>
          <p className="t-body">{p.p2}</p>
          <p className="t-emph pas__turn">{p.p3}</p>
        </div>
      </div>
    </section>
  );
}
