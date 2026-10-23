import { site } from '@/content/site';
import { Nav } from '@/components/layout/Nav';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/components/sections/Hero';
import { Paths } from '@/components/sections/Paths';
import { ChapterMarker } from '@/components/sections/ChapterMarker';
import { WhyLive } from '@/components/sections/WhyLive';
import { Occasions } from '@/components/sections/Occasions';
import { PullQuote } from '@/components/sections/PullQuote';
import { BookingSteps } from '@/components/sections/BookingSteps';
import { Testimonials } from '@/components/sections/Testimonials';
import { Coverage } from '@/components/sections/Coverage';
import { LessonsIntro } from '@/components/sections/LessonsIntro';
import { LessonsPAS } from '@/components/sections/LessonsPAS';
import { LessonsWho } from '@/components/sections/LessonsWho';
import { LessonsPath } from '@/components/sections/LessonsPath';
import { LessonsFormats } from '@/components/sections/LessonsFormats';
import { Gallery } from '@/components/sections/Gallery';
import { Faq } from '@/components/sections/Faq';
import { FinalCta } from '@/components/sections/FinalCta';
import { JsonLd } from '@/components/sections/JsonLd';
import { MotionProvider } from '@/components/providers/MotionProvider';
import { ConsoleProvider } from '@/components/overlays/ConsoleProvider';
import type { LightboxItem } from '@/components/overlays/types';
import { galleryItems, videoAction } from '@/content/derive';
import { getImage, pickVariant } from '@/lib/images';

/** Lightbox data, prepared at build time (image variants from the manifest, OQ-8). */
function lightboxItems(): LightboxItem[] {
  return galleryItems(site).map((it) => {
    const img = getImage(it.image);
    return {
      id: it.id,
      alt: it.alt,
      caption: it.caption,
      width: img.width,
      height: img.height,
      avif: img.avif ? pickVariant(img, 1600, 'avif') : '',
      webp: img.webp ? pickVariant(img, 1600, 'webp') : '',
      src: img.src,
      videoSrc: it.kind === 'video' ? (it.videoSrc ?? null) : null,
      externalUrl: it.kind === 'video' ? (it.externalUrl ?? null) : null,
      externalKind: it.kind === 'video' ? videoAction(it) : null,
    };
  });
}

export default function Home() {
  return (
    <>
      <JsonLd />
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Paths />
        <div id="performances" className="chapter-wrap">
          <ChapterMarker label={site.chapters.performances} tint="wine" />
          <WhyLive />
          <Occasions />
          <PullQuote />
          <BookingSteps />
          <Testimonials id="hosts" />
        </div>
        <Coverage />
        <div id="lessons" className="chapter-wrap">
          <ChapterMarker label={site.chapters.lessons} tint="amber" />
          <LessonsIntro />
          <LessonsPAS />
          <LessonsWho />
          <LessonsPath />
          <LessonsFormats />
          <Testimonials id="students" />
        </div>
        <div id="gallery" className="chapter-wrap">
          <ChapterMarker label={site.chapters.watch} tint="deep" />
          <Gallery />
        </div>
        <Faq />
        <FinalCta />
      </main>
      <Footer />
      <MotionProvider />
      <ConsoleProvider gallery={lightboxItems()} />
    </>
  );
}
