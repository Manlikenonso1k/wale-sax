/**
 * Motion tokens (§10.2). Springs for Motion (`motion/react`) plus the same springs
 * as CSS `linear()` easings, so first-load islands animate with zero JS runtime.
 */

export type SpringSpec = { type: 'spring'; bounce: number; duration: number };

export const springs = {
  ui: { type: 'spring', bounce: 0, duration: 0.35 },
  snap: { type: 'spring', bounce: 0, duration: 0.4 },
  flick: { type: 'spring', bounce: 0.2, duration: 0.4 },
  sheet: { type: 'spring', bounce: 0.2, duration: 0.3 },
} as const satisfies Record<string, SpringSpec>;

/** Scroll reveals: 0.9s cubic-bezier(.2,.8,.2,1). */
export const reveal = { duration: 0.9, ease: 'expo.out', css: 'cubic-bezier(.2,.8,.2,1)' } as const;

/** Pressed state: 80ms ease-out, scale 0.97. */
export const press = { duration: 0.08, scale: 0.97 } as const;

/** Stagger (seconds). */
export const stagger = { words: 0.04, cards: 0.1, occasions: 0.09, paths: 0.12 } as const;

/** Cross-fade used for pop-ups when motion is off. */
export const fadeOff = { duration: 0.15 } as const;

/**
 * Sample a duration/bounce spring (same model as Motion's `bounce` + `duration`)
 * into a CSS `linear()` easing string.
 */
export function springLinear(bounce: number, samples = 24): string {
  // Normalised time t ∈ [0, 1] maps to the perceptual duration.
  const zeta = 1 - bounce; // damping ratio
  const omega = 2 * Math.PI * 1.15; // ~settles within the duration
  const pts: string[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    let x: number;
    if (zeta >= 1) {
      const w = omega * 1.25;
      x = 1 - (1 + w * t) * Math.exp(-w * t);
    } else {
      const wd = omega * Math.sqrt(1 - zeta * zeta);
      x = 1 - Math.exp(-zeta * omega * t) * (Math.cos(wd * t) + ((zeta * omega) / wd) * Math.sin(wd * t));
    }
    pts.push(i === samples ? '1' : x.toFixed(4));
  }
  return `linear(${pts.join(', ')})`;
}
