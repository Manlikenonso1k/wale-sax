import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from './Wordmark';

/**
 * Sticky nav (§6.3, §7.18). M1: static. The Menu link opens a CSS (:target) panel
 * that works without JS; M2 replaces it with the Mobile Sheet.
 */
export function Nav() {
  return (
    <header className="nav" data-nav>
      <div className="container nav__inner">
        <a href="#top" className="nav__brand">
          <Wordmark />
        </a>
        <nav className="nav__links" aria-label={site.nav.label}>
          <ul>
            {site.nav.links.map((l) => (
              <li key={l.href}>
                <a className="nav__link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav__actions">
          <Button href={defaultLinks.general} size="S" console="contact" icon={null} className="nav__cta">
            {site.nav.cta}
          </Button>
          <a className="nav__menu press" href="#mobile-menu" data-open="sheet">
            <Icon name="menu" size={18} />
            <span>{site.ui.menu}</span>
          </a>
        </div>
      </div>
      <nav id="mobile-menu" className="mobile-menu" aria-label={site.ui.menu}>
        <ul>
          {site.nav.links.map((l) => (
            <li key={l.href}>
              <a className="mobile-menu__link" href={l.href}>
                {l.label}
              </a>
            </li>
          ))}
        </ul>
        <a className="mobile-menu__close press" href="#top" aria-label={site.ui.close}>
          <Icon name="close" size={20} />
        </a>
      </nav>
    </header>
  );
}
