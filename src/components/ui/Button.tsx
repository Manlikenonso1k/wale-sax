import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';

type Props = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline';
  size?: 'S' | 'M' | 'L' | 'XL';
  /** Which console this CTA opens once JS enhancement lands (M2). Without JS it is a plain link. */
  console?: 'booking' | 'lessons' | 'contact';
  icon?: IconName | null;
  iconPosition?: 'start' | 'end';
  /** Opens in a new tab (every wa.me link). */
  external?: boolean;
  magnetic?: boolean;
  className?: string;
  id?: string;
};

const iconSize = { S: 16, M: 18, L: 20, XL: 20 } as const;

/** Pill button rendered as a real <a href> (M-07). */
export function Button({
  href,
  children,
  variant = 'primary',
  size = 'M',
  console: consoleKind,
  icon = 'arrow',
  iconPosition = 'end',
  external,
  magnetic = false,
  className = '',
  id,
}: Props) {
  const isExternal = external ?? /^https?:\/\//.test(href);
  const ico = icon ? <Icon name={icon} size={iconSize[size]} /> : null;
  return (
    <a
      id={id}
      href={href}
      className={`btn btn--${variant} btn--${size.toLowerCase()} press ${className}`.trim()}
      data-console={consoleKind}
      data-fx={magnetic ? 'magnetic' : undefined}
      {...(isExternal ? { target: '_blank', rel: 'noopener' } : {})}
    >
      {iconPosition === 'start' && ico}
      <span>{children}</span>
      {iconPosition === 'end' && ico}
    </a>
  );
}
