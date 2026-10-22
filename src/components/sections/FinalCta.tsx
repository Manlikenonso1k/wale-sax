import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';

export function FinalCta() {
  const c = site.finalCta;
  return (
    <section id="contact" className="final rails" aria-labelledby="final-title" data-chapter-tint="bloom">
      <div className="final__bloom" aria-hidden="true" />
      <div className="container final__inner">
        <Eyebrow>{c.eyebrow}</Eyebrow>
        <SectionHeading id="final-title" text={c.heading} size="final" />
        <p className="t-lead final__body">{c.body}</p>
        <div className="final__ctas">
          <Button href={defaultLinks.booking} size="XL" console="booking" magnetic>
            {c.cta1}
          </Button>
          <Button href={defaultLinks.lessons} size="XL" variant="outline" console="lessons" magnetic>
            {c.cta2}
          </Button>
        </div>
        <p className="microcopy final__call">
          {c.callPrefix}{' '}
          <a className="final__tel" href={site.phoneHref}>
            {site.whatsapp.display}
          </a>
        </p>
      </div>
    </section>
  );
}
