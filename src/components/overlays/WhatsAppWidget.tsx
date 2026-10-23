import { site } from '@/content/site';
import { defaultLinks } from '@/lib/whatsapp';
import { Icon, type IconName } from '@/components/ui/Icon';
import { ContactPopover, type ContactOption } from './ContactPopover';

const OPTION_ICONS: Record<string, IconName> = { booking: 'calendar', lessons: 'note', general: 'chat' };

/** The three contact options (§6.3), each a real wa.me link. Server-built, passed to client islands as props. */
export function contactOptions(): ContactOption[] {
  return site.contactOptions.map((o) => ({
    kind: o.kind,
    label: o.label,
    href: defaultLinks[o.kind],
    icon: <Icon name={OPTION_ICONS[o.kind]} size={20} />,
  }));
}

/**
 * Floating WhatsApp button, bottom-right on every viewport (M-06, §9.4).
 * No JS: a plain link to the general template. With JS: opens the three-option panel.
 */
export function WhatsAppWidget() {
  return (
    <div className="wa-widget">
      <ContactPopover
        variant="widget"
        href={defaultLinks.general}
        triggerClassName="wa-widget__button press"
        ariaLabel={site.widget.ariaLabel}
        dataWidget
        triggerContent={
          <>
            <span className="wa-widget__chip" aria-hidden="true">
              {site.widget.chip}
            </span>
            <span className="wa-widget__circle">
              <Icon name="whatsapp" size={30} />
            </span>
          </>
        }
        panelLabel={site.widget.title}
        title={site.widget.title}
        status={site.widget.status}
        closeLabel={site.ui.close}
        closeIcon={<Icon name="close" size={18} />}
        options={contactOptions()}
      />
    </div>
  );
}
