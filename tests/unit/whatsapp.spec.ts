// §16.2 Q28 — whatsapp.ts exact strings + date parsing in a timezone west of UTC.
// TZ is set in-process (cross-platform; OQ-14) before any date is created.
process.env.TZ = 'America/Los_Angeles';

import { test, expect } from '@playwright/test';
import {
  bookingMessage,
  cleanText,
  defaultLinks,
  formatDate,
  generalMessage,
  lessonsMessage,
  parseISODate,
  waLink,
} from '@/lib/whatsapp';

const BOOK = 'Hi Wale, I found your website and I’d like to book you.';
const LESS = 'Hi Wale, I found your website and I’d like saxophone lessons.';
const GEN = 'Hi Wale, I found your website and I have a question:';

test('Q28: the process really runs west of UTC', () => {
  expect([420, 480]).toContain(new Date(2026, 10, 14).getTimezoneOffset());
});

test('Q28: booking — empty form (default/no-JS)', () => {
  expect(bookingMessage()).toBe(`${BOOK}\nOccasion: \nDate: \nLocation: \nGuests: `);
});

test('Q28: booking — full form', () => {
  expect(
    bookingMessage({
      occasion: 'Wedding',
      date: '2026-11-14',
      location: 'Lekki Phase 1',
      guests: '100–300',
      notes: 'Entrance at 4pm',
    }),
  ).toBe(`${BOOK}\nOccasion: Wedding\nDate: Saturday, 14 November 2026\nLocation: Lekki Phase 1\nGuests: 100–300\nEntrance at 4pm`);
});

test('Q28: booking — date not fixed yet', () => {
  expect(bookingMessage({ occasion: 'Birthday or surprise', date: '2026-11-14', dateUnfixed: true })).toBe(
    `${BOOK}\nOccasion: Birthday or surprise\nDate: Not fixed yet\nLocation: \nGuests: `,
  );
});

test('Q28: booking — trims input and collapses 3+ newlines in notes', () => {
  expect(bookingMessage({ location: '  Ajah  ', notes: '  line 1\n\n\n\nline 2  ' })).toBe(
    `${BOOK}\nOccasion: \nDate: \nLocation: Ajah\nGuests: \nline 1\n\nline 2`,
  );
  expect(cleanText('a\r\n\r\n\r\nb')).toBe('a\n\nb');
});

test('Q28: lessons — empty form (default/no-JS)', () => {
  expect(lessonsMessage()).toBe(`${LESS}\nWho’s learning: \nExperience: \nFormat: \nArea: \nPreferred days: `);
});

test('Q28: lessons — full form (age only appears when given)', () => {
  expect(
    lessonsMessage({ who: 'My child', age: 9, experience: 'Never played', format: 'Home lessons', area: 'Ajah', days: ['Mon', 'Sat'] }),
  ).toBe(`${LESS}\nWho’s learning: My child (age 9)\nExperience: Never played\nFormat: Home lessons\nArea: Ajah\nPreferred days: Mon, Sat`);
  expect(lessonsMessage({ who: 'Me', experience: 'A little', days: ['Flexible'] })).toBe(
    `${LESS}\nWho’s learning: Me\nExperience: A little\nFormat: \nArea: \nPreferred days: Flexible`,
  );
});

test('Q28: general template', () => {
  expect(generalMessage()).toBe(GEN);
});

test('Q28: waLink format (digits only, encodeURIComponent, %0A newlines)', () => {
  expect(waLink('a b\nc')).toBe('https://wa.me/2347040149133?text=a%20b%0Ac');
  expect(defaultLinks.general).toBe(`https://wa.me/2347040149133?text=${encodeURIComponent(GEN)}`);
  expect(defaultLinks.booking).toBe(`https://wa.me/2347040149133?text=${encodeURIComponent(bookingMessage())}`);
  expect(defaultLinks.lessons).toBe(`https://wa.me/2347040149133?text=${encodeURIComponent(lessonsMessage())}`);
  expect(defaultLinks.booking).toContain('%0A');
});

test('Q28: date parsing never shifts the day west of UTC', () => {
  const d = parseISODate('2026-11-14')!;
  expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getDay()]).toEqual([2026, 10, 14, 6]);
  expect(formatDate('2026-11-14')).toBe('Saturday, 14 November 2026');
  expect(formatDate('2026-01-01')).toBe('Thursday, 1 January 2026');
  expect(parseISODate('2026-02-30')).toBeNull();
  expect(parseISODate('14/11/2026')).toBeNull();
});
