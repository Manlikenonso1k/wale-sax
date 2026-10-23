'use client';

import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { bookingMessage, defaultLinks, waLink } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';
import { ChipGroup } from './ChipGroup';
import { MessagePreview } from './MessagePreview';

const c = site.consoles.booking;

/** Booking Console (§9.2): the WhatsApp message writes itself; Send is a real link. */
export function BookingConsole({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [occasion, setOccasion] = useState('');
  const [date, setDate] = useState('');
  const [dateUnfixed, setDateUnfixed] = useState(false);
  const [location, setLocation] = useState('');
  const [guests, setGuests] = useState('');
  const [notes, setNotes] = useState('');
  const dateRef = useRef<HTMLInputElement>(null);

  // `min` = today, set on the client after mount only (never during render).
  useEffect(() => {
    if (!open || !dateRef.current) return;
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    dateRef.current.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, [open]);

  const message = bookingMessage({ occasion, date, dateUnfixed, location, guests, notes });

  return (
    <ModalShell open={open} onClose={onClose} title={c.title} description={c.subtitle} className="console">
      <form className="console__form" onSubmit={(e) => e.preventDefault()}>
        <ChipGroup legend={c.occasionLegend} name="occasion" type="radio" options={c.occasions} value={occasion} onChange={(v) => setOccasion(v as string)} autoFocusFirst />
        <div className="field">
          <label className="field__label" htmlFor="bk-date">
            {c.dateLabel}
          </label>
          <input ref={dateRef} id="bk-date" className="input" type="date" value={date} disabled={dateUnfixed} onChange={(e) => setDate(e.target.value)} />
          <label className="check">
            <input type="checkbox" checked={dateUnfixed} onChange={(e) => setDateUnfixed(e.target.checked)} />
            <span>{c.dateUnfixed}</span>
          </label>
        </div>
        <div className="field">
          <label className="field__label" htmlFor="bk-location">
            {c.locationLabel}
          </label>
          <input id="bk-location" className="input" type="text" list="bk-areas" placeholder={c.locationPlaceholder} value={location} onChange={(e) => setLocation(e.target.value)} autoComplete="off" />
          <datalist id="bk-areas">
            {site.areas.map((a) => (
              <option key={a} value={a} />
            ))}
          </datalist>
        </div>
        <ChipGroup legend={c.guestsLegend} name="guests" type="radio" options={c.guests} value={guests} onChange={(v) => setGuests(v as string)} />
        <div className="field">
          <label className="field__label" htmlFor="bk-notes">
            {c.notesLabel}
          </label>
          <textarea id="bk-notes" className="input input--area" rows={3} placeholder={c.notesPlaceholder} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </form>
      <MessagePreview id="bk-preview" title={c.preview} text={message} />
      <div className="console__actions">
        <a className="btn btn--primary btn--xl press console__send" href={waLink(message)} target="_blank" rel="noopener" data-send="booking">
          <Icon name="whatsapp" size={20} />
          <span>{c.send}</span>
        </a>
        <a className="text-link console__hi" href={defaultLinks.general} target="_blank" rel="noopener">
          <span>{c.sayHi}</span>
          <Icon name="arrow" size={16} />
        </a>
      </div>
    </ModalShell>
  );
}
