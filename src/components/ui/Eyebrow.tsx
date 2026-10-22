import type { ReactNode } from 'react';

type Props = { children: ReactNode; tone?: 'brass' | 'muted'; liveDot?: boolean; className?: string };

export function Eyebrow({ children, tone = 'brass', liveDot = false, className = '' }: Props) {
  return (
    <p className={`t-eyebrow ${tone === 'muted' ? 't-eyebrow--muted' : ''} ${className}`.trim()}>
      {liveDot && <span className="live-dot" aria-hidden="true" />}
      {children}
    </p>
  );
}
