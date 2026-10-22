import Link from 'next/link';
import { site } from '@/content/site';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Wordmark } from '@/components/layout/Wordmark';

export default function NotFound() {
  const n = site.notFound;
  return (
    <>
      <header className="nav nav--plain">
        <div className="container nav__inner">
          <Link href="/" className="nav__brand">
            <Wordmark />
          </Link>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="lost rails">
        <div className="container lost__inner">
          <Eyebrow>{n.eyebrow}</Eyebrow>
          <SectionHeading id="lost-title" as="h1" size="h1" text={n.heading} />
          <p className="t-lead">{n.body}</p>
          <Button href="/" size="L" icon="arrow">
            {n.home}
          </Button>
        </div>
      </main>
    </>
  );
}
