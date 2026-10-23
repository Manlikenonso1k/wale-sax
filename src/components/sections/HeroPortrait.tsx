import { site } from '@/content/site';
import { HudFrame } from '@/components/ui/HudFrame';
import { Picture } from '@/components/ui/Picture';

/** The LCP element: never hidden, never waits on JS (M-15). */
export function HeroPortrait() {
  return (
    <div className="hero__portrait" data-fx="tilt sheen" data-tilt-max="6">
      <HudFrame leg={18} className="hero__frame">
        <Picture
          name={site.hero.image.file}
          alt={site.hero.image.alt}
          sizes="(min-width: 900px) 500px, 100vw"
          priority
          className="edge-mask"
        />
        <span className="hero__sheen" aria-hidden="true" />
        <span className="hero__scan" aria-hidden="true" />
      </HudFrame>
    </div>
  );
}
