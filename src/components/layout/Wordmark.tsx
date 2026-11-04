import { site } from '@/content/site';

/**
 * Brand wordmark: “Music by Kent” + “MBK 🎷”. In the nav on very narrow screens
 * (< 385px) the short form “MBK 🎷” replaces the full name (CSS in globals.css).
 */
export function Wordmark({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  const { name, short, emoji } = site.brand;
  return (
    <span className={`wordmark wordmark--${size}`}>
      <span className="wordmark__name">
        <span className="wordmark__full">{name}</span>
        {size === 'nav' && (
          <span className="wordmark__short">
            {short} <span aria-hidden="true">{emoji}</span>
          </span>
        )}
      </span>
      <span className="wordmark__label">
        {size === 'footer' ? `(${short})` : short} <span aria-hidden="true">{emoji}</span>
      </span>
    </span>
  );
}
