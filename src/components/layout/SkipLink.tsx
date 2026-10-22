import { site } from '@/content/site';

export function SkipLink() {
  return (
    <a className="skip-link" href="#main">
      {site.ui.skipLink}
    </a>
  );
}
