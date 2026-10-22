import { site } from '@/content/site';
import { lessonsLead, lessonsMicrocopy } from '@/content/derive';
import { defaultLinks } from '@/lib/whatsapp';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { HudFrame } from '@/components/ui/HudFrame';
import { Picture } from '@/components/ui/Picture';

export function LessonsIntro() {
  const l = site.lessonsIntro;
  return (
    <section id="lessons-intro" className="section" aria-labelledby="lessons-title" data-chapter-tint="amber">
      <div className="container lessons-intro">
        <div className="lessons-intro__copy">
          <header className="section-head">
            <Eyebrow>{l.eyebrow}</Eyebrow>
            <SectionHeading id="lessons-title" text={l.heading} />
          </header>
          <p className="t-lead">{lessonsLead(site)}</p>
          <div className="lessons-intro__cta">
            <Button href={defaultLinks.lessons} size="L" console="lessons" magnetic>
              {l.cta}
            </Button>
            <p className="microcopy">{lessonsMicrocopy(site)}</p>
          </div>
        </div>
        <div className="lessons-intro__media">
          <HudFrame leg={16}>
            <Picture name={l.image.file} alt={l.image.alt} sizes="(min-width: 900px) 460px, 100vw" className="edge-mask edge-mask--soft" />
          </HudFrame>
        </div>
      </div>
    </section>
  );
}
