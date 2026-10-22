import { Fragment } from 'react';
import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { HeroPortrait } from './HeroPortrait';

export function Hero() {
  const h = site.hero;
  return (
    <section id="top" className="hero rails" aria-labelledby="hero-title">
      <div className="hero__glow" aria-hidden="true" />
      <div className="container hero__inner">
        <div className="hero__copy">
          <Eyebrow tone="muted" liveDot className="hero__eyebrow">
            {h.eyebrow}
          </Eyebrow>
          <h1 id="hero-title" className="t-h1 hero__title">
            {h.h1Words.map((word, i) => (
              <Fragment key={i}>
                {i > 0 && ' '}
                {i === h.h1EmphasisIndex ? (
                  <em className="hero__word" style={{ ['--i' as string]: i }}>
                    {word}
                  </em>
                ) : (
                  <span className="hero__word" style={{ ['--i' as string]: i }}>
                    {word}
                  </span>
                )}
              </Fragment>
            ))}
          </h1>
          <p className="t-lead hero__lead">{h.lead}</p>
          <div className="hero__ctas">
            <Button href={defaultLinks.booking} size="L" console="booking" magnetic>
              {h.primaryCta}
            </Button>
            <Button href={defaultLinks.lessons} size="L" variant="outline" console="lessons">
              {h.secondaryCta}
            </Button>
          </div>
          <p className="microcopy hero__micro">{h.microcopy}</p>
          <dl className="stats hero__stats">
            {site.stats.map((s) => (
              <div key={s.label} className="stat">
                <dt className="t-stat-label">{s.label}</dt>
                <dd className="t-stat-value">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroPortrait />
      </div>
    </section>
  );
}
