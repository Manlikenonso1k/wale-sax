import { site } from '@/content/site';
import { HudFrame } from '@/components/ui/HudFrame';
import { Picture } from '@/components/ui/Picture';

/** The LCP element: never hidden, never waits on JS (M-15). */
export function HeroPortrait() {
  return (
    <div className="hero__portrait" data-fx="tilt sheen">
      <HudFrame leg={18} className="hero__frame">
        <Picture
          name={site.hero.image.file}
          alt={site.hero.image.alt}
          sizes="(min-width: 900px) 500px, 100vw"
          priority
          className="edge-mask"
        />
      </HudFrame>
    </div>
  );
}
