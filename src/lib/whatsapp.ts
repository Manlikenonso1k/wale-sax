/**
 * WhatsApp link and message builders (§9.6). Logic only: every word of the
 * templates lives in site.messages (OQ-7).
 */
import { site } from '@/content/site';

const m = site.messages;

export const waLink = (message: string) =>
  `https://wa.me/${site.whatsapp.number}?text=${encodeURIComponent(message)}`;

/** Trim and collapse runs of 3+ newlines into a single blank line. */
export function cleanText(value: string | null | undefined): string {
  return (value ?? '')
    .replace(/\r\n?/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Parse yyyy-mm-dd as a LOCAL date (never `new Date('yyyy-mm-dd')`, which is UTC). */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const [, y, mo, d] = match.map(Number) as [number, number, number, number];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

/** e.g. “Saturday, 14 November 2026”. */
export function formatDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return cleanText(value);
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export type BookingFields = {
  occasion?: string;
  date?: string;
  dateUnfixed?: boolean;
  location?: string;
  guests?: string;
  notes?: string;
};

export function bookingMessage(f: BookingFields = {}): string {
  const L = m.bookingLabels;
  const date = f.dateUnfixed ? m.dateNotFixed : f.date ? formatDate(f.date) : '';
  const lines = [
    m.bookingIntro,
    `${L.occasion}: ${cleanText(f.occasion)}`,
    `${L.date}: ${date}`,
    `${L.location}: ${cleanText(f.location)}`,
    `${L.guests}: ${cleanText(f.guests)}`,
  ];
  const notes = cleanText(f.notes);
  if (notes) lines.push(notes);
  return lines.join('\n');
}

export type LessonsFields = {
  who?: string;
  age?: string | number;
  experience?: string;
  format?: string;
  area?: string;
  days?: string[];
};

export function lessonsMessage(f: LessonsFields = {}): string {
  const L = m.lessonsLabels;
  const age = cleanText(f.age == null ? '' : String(f.age));
  const ageText = age ? L.age.replace('{age}', age) : '';
  return [
    m.lessonsIntro,
    `${L.who}: ${cleanText(f.who)}${ageText}`,
    `${L.experience}: ${cleanText(f.experience)}`,
    `${L.format}: ${cleanText(f.format)}`,
    `${L.area}: ${cleanText(f.area)}`,
    `${L.days}: ${(f.days ?? []).map(cleanText).filter(Boolean).join(', ')}`,
  ].join('\n');
}

export function generalMessage(): string {
  return m.generalIntro;
}

/** Default (no-JS) links for each contact kind. */
export const defaultLinks = {
  booking: waLink(bookingMessage()),
  lessons: waLink(lessonsMessage()),
  general: waLink(generalMessage()),
} as const;
