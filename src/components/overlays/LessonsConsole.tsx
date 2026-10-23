'use client';

import { useState } from 'react';
import { site } from '@/content/site';
import { lessonsConsoleQuestions } from '@/content/derive';
import { lessonsMessage, waLink } from '@/lib/whatsapp';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';
import { ChipGroup } from './ChipGroup';
import { MessagePreview } from './MessagePreview';

const c = site.consoles.lessons;
const q = lessonsConsoleQuestions(site);
const formatOptions = [...q.formats.map((f) => c.formats[f]), c.formats.notSure];
const impliedFormat = q.impliedFormat ? c.formats[q.impliedFormat] : '';

/** Lessons Console (§9.3). */
export function LessonsConsole({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [who, setWho] = useState('');
  const [age, setAge] = useState('');
  const [experience, setExperience] = useState('');
  const [format, setFormat] = useState('');
  const [area, setArea] = useState('');
  const [days, setDays] = useState<string[]>([]);

  const showAge = c.whoWithAge.some((i) => c.who[i] === who);
  const sentFormat = q.askFormat ? format : impliedFormat;
  const showArea = q.areaAlways || format === c.formats.home;
  const message = lessonsMessage({
    who,
    age: showAge ? age : '',
    experience,
    format: sentFormat,
    area: showArea ? area : '',
    days: c.days.filter((d) => days.includes(d)),
  });

  return (
    <ModalShell open={open} onClose={onClose} title={c.title} description={c.subtitle} className="console">
      <form className="console__form" onSubmit={(e) => e.preventDefault()}>
        <ChipGroup legend={c.whoLegend} name="who" type="radio" options={c.who} value={who} onChange={(v) => setWho(v as string)} autoFocusFirst />
        {showAge && (
          <div className="field">
            <label className="field__label" htmlFor="ls-age">
              {c.ageLabel}
            </label>
            <input id="ls-age" className="input input--short" type="number" inputMode="numeric" min={1} max={99} value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
        )}
        <ChipGroup legend={c.experienceLegend} name="experience" type="radio" options={c.experience} value={experience} onChange={(v) => setExperience(v as string)} />
        {q.askFormat && (
          <ChipGroup legend={c.formatLegend} name="format" type="radio" options={formatOptions} value={format} onChange={(v) => setFormat(v as string)} />
        )}
        {showArea && (
          <div className="field">
            <label className="field__label" htmlFor="ls-area">
              {c.areaLabel}
            </label>
            <input id="ls-area" className="input" type="text" list="ls-areas" value={area} onChange={(e) => setArea(e.target.value)} autoComplete="off" />
            <datalist id="ls-areas">
              {site.areas.map((a) => (
                <option key={a} value={a} />
              ))}
            </datalist>
          </div>
        )}
        <ChipGroup legend={c.daysLegend} name="days" type="checkbox" options={c.days} value={days} onChange={(v) => setDays(v as string[])} />
      </form>
      <MessagePreview id="ls-preview" title={site.consoles.booking.preview} text={message} />
      <div className="console__actions">
        <a className="btn btn--primary btn--xl press console__send" href={waLink(message)} target="_blank" rel="noopener" data-send="lessons">
          <Icon name="whatsapp" size={20} />
          <span>{site.consoles.booking.send}</span>
        </a>
      </div>
    </ModalShell>
  );
}
