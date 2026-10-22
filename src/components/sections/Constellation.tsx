import { site } from '@/content/site';

/**
 * Stylised west→east “map” of the areas (§7.9). Decorative: aria-hidden.
 * The accessible list is the area chips next to it.
 * Positions are layout data (percent of the box), not copy. Unknown areas are skipped.
 */
const POSITIONS: Record<string, [number, number]> = {
  Magodo: [16, 16],
  Ikeja: [9, 34],
  Yaba: [26, 46],
  Surulere: [15, 62],
  Festac: [7, 82],
  Ikoyi: [43, 40],
  'Victoria Island': [49, 60],
  Lekki: [64, 52],
  Ajah: [78, 44],
  Sangotedo: [87, 26],
  'Ibeju-Lekki': [92, 70],
};
const HOME = 'Ajah';

export function Constellation() {
  const nodes = site.areas.filter((a) => POSITIONS[a]);
  const home = POSITIONS[HOME];
  return (
    <figure className="constellation">
      <div className="constellation__map" aria-hidden="true">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="constellation__svg" focusable="false">
          {home &&
            nodes
              .filter((a) => a !== HOME)
              .map((a) => {
                const [x, y] = POSITIONS[a];
                return (
                  <line
                    key={a}
                    x1={home[0]}
                    y1={home[1]}
                    x2={x}
                    y2={y}
                    className="constellation__line"
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    data-scrub="constellation"
                  />
                );
              })}
        </svg>
        {nodes.map((a) => {
          const [x, y] = POSITIONS[a];
          const isHome = a === HOME;
          return (
            <span
              key={a}
              className={`constellation__node ${isHome ? 'is-home' : ''}`.trim()}
              data-area={a}
              data-align={x < 20 ? 'start' : x > 80 ? 'end' : 'center'}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="constellation__dot" />
              <span className="constellation__label">
                {a}
                {isHome && <span className="constellation__base"> · {site.coverage.baseLabel}</span>}
              </span>
            </span>
          );
        })}
      </div>
      <figcaption className="t-caption constellation__caption">{site.coverage.mapCaption}</figcaption>
    </figure>
  );
}
