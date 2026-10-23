import { site } from '@/content/site';
import { pathsCards } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { HudFrame } from '@/components/ui/HudFrame';
import { Icon } from '@/components/ui/Icon';

function OrbitGlyph() {
  return (
    <svg className="orbit-glyph" viewBox="0 0 120 48" width="120" height="48" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="24" rx="54" ry="16" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle className="orbit-glyph__core" cx="60" cy="24" r="3" />
      <circle className="orbit-glyph__dot" cx="114" cy="24" r="3.5" />
    </svg>
  );
}

export function Paths() {
  const p = site.paths;
  return (
    <section id="paths" className="section" aria-labelledby="paths-title">
      <div className="container stack-48">
        <header className="section-head">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <SectionHeading id="paths-title" text={p.heading} />
        </header>
        <ul className="paths__grid" data-reveal="rise" data-stagger="120">
          {pathsCards(site).map((c) => (
            <li key={c.href}>
              <HudFrame as="article" className="panel path-card" leg={16}>
                <div className="path-card__inner" data-fx="tilt spotlight" data-tilt-max="8">
                  <OrbitGlyph />
                  <p className="t-caption path-card__label">{c.label}</p>
                  <h3 className="t-card-title path-card__title">{c.title}</h3>
                  <p className="t-card-body">{c.body}</p>
                  <a className="text-link path-card__link" href={c.href}>
                    <span>{c.link}</span>
                    <Icon name="arrow" size={18} />
                  </a>
                </div>
              </HudFrame>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
