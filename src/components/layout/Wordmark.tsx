import { site } from '@/content/site';

export function Wordmark({ size = 'nav' }: { size?: 'nav' | 'footer' }) {
  return (
    <span className={`wordmark wordmark--${size}`}>
      <span className="wordmark__name">{site.name}</span>
      {size === 'nav' && <span className="wordmark__label">{site.role}</span>}
    </span>
  );
}
