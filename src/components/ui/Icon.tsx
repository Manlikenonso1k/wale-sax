import { siInstagram, siWhatsapp } from 'simple-icons';

export type IconName =
  | 'arrow'
  | 'arrow-up-right'
  | 'plus'
  | 'menu'
  | 'close'
  | 'whatsapp'
  | 'instagram'
  | 'note'
  | 'star'
  | 'arch'
  | 'wave'
  | 'phone'
  | 'calendar'
  | 'chat'
  | 'chevron-left'
  | 'chevron-right'
  | 'play';

const strokePaths: Record<Exclude<IconName, 'whatsapp' | 'instagram'>, string[]> = {
  arrow: ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up-right': ['M7 17 17 7', 'M8 7h9v9'],
  plus: ['M12 5v14', 'M5 12h14'],
  menu: ['M4 8h16', 'M4 16h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  // single note
  note: ['M9 18V5l10-2v2L9 7', 'M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z'],
  // small star
  star: ['M12 4l2.2 5 5.3.5-4 3.6 1.2 5.3L12 15.7 7.3 18.4l1.2-5.3-4-3.6 5.3-.5Z'],
  // arch
  arch: ['M5 20V11a7 7 0 0 1 14 0v9', 'M9 20v-8a3 3 0 0 1 6 0v8', 'M3 20h18'],
  // waveform
  wave: ['M3 12h2', 'M7 8v8', 'M11 5v14', 'M15 9v6', 'M19 11v2', 'M21 12h0'],
  calendar: ['M7 3v3', 'M17 3v3', 'M4 8h16', 'M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z'],
  chat: ['M7.9 20A9 9 0 1 0 4 16.1L2 22Z'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'chevron-right': ['m9 18 6-6-6-6'],
  play: ['M7 4.5v15l12.5-7.5Z'],
  phone: [
    'M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.9.6 2.8.7a2 2 0 0 1 1.7 2Z',
  ],
};

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number };

/** Inline icons (§5.7): stroke SVGs, plus simple-icons glyphs for WhatsApp/Instagram. Decorative. */
export function Icon({ name, size = 20, className, strokeWidth = 1.9 }: Props) {
  if (name === 'whatsapp' || name === 'instagram') {
    const glyph = name === 'whatsapp' ? siWhatsapp : siInstagram;
    return (
      <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d={glyph.path} />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {strokePaths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
