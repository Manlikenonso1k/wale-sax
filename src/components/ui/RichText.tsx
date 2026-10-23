import { Fragment, type ReactNode } from 'react';

const NBSP = ' ';
const DASH = /[—–]/;

/**
 * No-break spaces in site.ts steer line breaks (D-018, D-021):
 *  - a no-break space touching a dash (“— anywhere”) always binds, so no line starts with a dash;
 *  - any other no-break space binds only on phones (< 640px): its words are wrapped in a
 *    `.keep` span (white-space: nowrap below 640px) and the DOM text gets a normal space.
 */
function withKeeps(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  let buffer = '';
  text.split(/([ \t\n\r]+)/).forEach((token, t) => {
    if (!token.includes(NBSP)) {
      buffer += token;
      return;
    }
    const words = token.split(NBSP);
    let phoneOnly = false;
    let rebuilt = words[0];
    for (let j = 1; j < words.length; j++) {
      const touchesDash = DASH.test(words[j - 1].slice(-1)) || DASH.test(words[j].charAt(0));
      if (touchesDash) rebuilt += NBSP + words[j];
      else {
        phoneOnly = true;
        rebuilt += ' ' + words[j];
      }
    }
    if (!phoneOnly) {
      buffer += rebuilt;
      return;
    }
    if (buffer) out.push(buffer);
    buffer = '';
    out.push(
      <span key={`${keyBase}-${t}`} className="keep">
        {rebuilt}
      </span>,
    );
  });
  if (buffer) out.push(buffer);
  return out;
}

/** Renders `*emphasis*` markup from site.ts as italic brass <em> (§5.4). */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*') ? (
          <em key={i}>{withKeeps(part.slice(1, -1), `e${i}`)}</em>
        ) : (
          <Fragment key={i}>{withKeeps(part, `t${i}`)}</Fragment>
        ),
      )}
    </>
  );
}
