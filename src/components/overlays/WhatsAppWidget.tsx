import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';

/**
 * Floating WhatsApp button, bottom-right on every viewport (M-06).
 * M1 / no-JS: a plain link to the general template. M2 adds the three-option panel.
 */
export function WhatsAppWidget() {
  return (
    <div className="wa-widget">
      <a
        className="wa-widget__button press"
        href={defaultLinks.general}
        target="_blank"
        rel="noopener"
        aria-label={site.widget.ariaLabel}
        data-widget
      >
        <span className="wa-widget__chip" aria-hidden="true">
          {site.widget.chip}
        </span>
        <span className="wa-widget__circle">
          <Icon name="whatsapp" size={30} />
        </span>
      </a>
    </div>
  );
}
