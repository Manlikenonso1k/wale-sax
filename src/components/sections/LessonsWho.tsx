import { site } from '@/content/site';
import { whoCards } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon, type IconName } from '@/components/ui/Icon';

const ICONS: Record<'beginner' | 'young' | 'church' | 'advanced', IconName> = {
  beginner: 'note',
  young: 'star',
  church: 'arch',
  advanced: 'wave',
};

export function LessonsWho() {
  const w = site.lessonsWho;
  return (
    <section id="lessons-who" className="section" aria-labelledby="who-title">
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{w.eyebrow}</Eyebrow>
          <SectionHeading id="who-title" text={w.heading} />
        </header>
        <ul className="who__grid" data-reveal="rise" data-stagger="90">
          {whoCards(site).map((c) => (
            <li key={c.key} className="panel who-card" data-fx="tilt spotlight">
              <span className="who-card__icon">
                <Icon name={ICONS[c.key]} size={22} />
              </span>
              <h3 className="t-h3">{c.title}</h3>
              <p className="t-card-body">{c.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
