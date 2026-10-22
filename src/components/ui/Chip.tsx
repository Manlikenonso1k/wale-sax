import type { ReactNode } from 'react';

type Props = { children: ReactNode; highlight?: boolean; as?: 'li' | 'span'; className?: string; dataArea?: string };

export function Chip({ children, highlight = false, as = 'span', className = '', dataArea }: Props) {
  const Tag = as;
  return (
    <Tag className={`chip ${highlight ? 'chip--highlight' : ''} ${className}`.trim()} data-area={dataArea}>
      {children}
    </Tag>
  );
}
