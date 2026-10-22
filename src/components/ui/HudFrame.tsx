import type { ReactNode } from 'react';

type Props = { children: ReactNode; leg?: 14 | 16 | 18; className?: string; as?: 'div' | 'article' };

/** Hairline brass L-shaped corner ticks (§5.6). Never a full rectangle. */
export function HudFrame({ children, leg = 16, className = '', as = 'div' }: Props) {
  const Tag = as;
  return (
    <Tag className={`hud ${className}`.trim()} style={{ ['--hud-leg' as string]: `${leg}px` }}>
      <span className="hud__tick hud__tick--tl" aria-hidden="true" />
      <span className="hud__tick hud__tick--tr" aria-hidden="true" />
      <span className="hud__tick hud__tick--bl" aria-hidden="true" />
      <span className="hud__tick hud__tick--br" aria-hidden="true" />
      {children}
    </Tag>
  );
}
