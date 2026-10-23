import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { ContactPopover } from '@/components/overlays/ContactPopover';
import { contactOptions } from '@/components/overlays/WhatsAppWidget';
import { Icon } from '@/components/ui/Icon';
import { Wordmark } from './Wordmark';
import { NavController } from './NavController';

/**
 * Sticky nav (§6.3, §7.18). Without JS the Menu link opens a CSS (:target) panel;
 * with JS (overlays ready) it opens the Mobile Sheet. “Message Wale” opens the Contact Menu.
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
          <ContactPopover
            variant="menu"
            href={defaultLinks.general}
            triggerClassName="btn btn--primary btn--s press nav__cta"
            triggerContent={<span>{site.nav.cta}</span>}
            panelLabel={site.nav.cta}
            closeLabel={site.ui.close}
            closeIcon={<Icon name="close" size={18} />}
            options={contactOptions()}
          />
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
      <span className="scroll-progress" aria-hidden="true" />
      <NavController />
    </header>
  );
}
