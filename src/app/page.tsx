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
    </>
  );
}
