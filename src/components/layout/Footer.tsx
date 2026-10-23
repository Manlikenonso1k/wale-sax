import { site } from '@/content/site';
import { footerName, instagramLink } from '@/content/derive';
import { defaultLinks } from '@/lib/whatsapp';
import { Wordmark } from './Wordmark';
import { MotionToggle } from './MotionToggle';

export function Footer() {
  const { fullName } = footerName(site);
  const ig = instagramLink(site);
  const igText = `${site.footer.instagramLabel} · ${ig.handle}`;
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <p className="footer__name">
            <Wordmark size="footer" />
            {fullName && <span className="footer__fullname">{fullName}</span>}
          </p>
          <p className="footer__tagline">{site.footer.tagline}</p>
        </div>
        <ul className="footer__links">
          <li>
            <a className="footer__link" href={defaultLinks.general} target="_blank" rel="noopener">
              {site.footer.whatsappLabel}
            </a>
          </li>
          <li>
            {ig.href ? (
              <a className="footer__link" href={ig.href} target="_blank" rel="noopener">
                {igText}
              </a>
            ) : (
              <span className="footer__text">{igText}</span>
            )}
          </li>
          <li className="footer__toggle">
            <MotionToggle label={site.ui.motionLabel} on={site.ui.motionOn} off={site.ui.motionOff} />
          </li>
          <li>
            <span className="footer__text footer__faint">{site.footer.copyright}</span>
          </li>
        </ul>
      </div>
    </footer>
  );
}
