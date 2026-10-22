import { site } from '@/content/site';
import { galleryItems, instagramLink } from '@/content/derive';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Icon } from '@/components/ui/Icon';
import { DomGallery } from './DomGallery';

export function Gallery() {
  const w = site.watch;
  const ig = instagramLink(site);
  const igText = `${w.instagramLink} · ${ig.handle}`;
  return (
    <section id="watch" className="section" aria-labelledby="gallery-title" data-chapter-tint="deep">
      <div className="container stack-48">
        <div className="gallery__head">
          <header className="section-head">
            <Eyebrow>{w.eyebrow}</Eyebrow>
            <SectionHeading id="gallery-title" text={w.heading} />
          </header>
          {ig.href ? (
            <a className="text-link gallery__ig" href={ig.href} target="_blank" rel="noopener">
              <span>{igText}</span>
              <Icon name="arrow-up-right" size={16} />
            </a>
          ) : (
            <p className="gallery__ig gallery__ig--text">{igText}</p>
          )}
        </div>
        <DomGallery items={galleryItems(site)} />
      </div>
    </section>
  );
}
