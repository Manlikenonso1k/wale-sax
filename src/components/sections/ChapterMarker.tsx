type Tint = 'wine' | 'neutral' | 'amber' | 'deep' | 'dim' | 'bloom';

/** Full-width hairline with a centred caption label and brass ticks (§7.3). */
export function ChapterMarker({ label, tint }: { label: string; tint: Tint }) {
  return (
    <div className="chapter" data-chapter-tint={tint} data-reveal="line">
      <div className="container chapter__inner">
        <span className="chapter__line" aria-hidden="true" />
        <span className="chapter__tick" aria-hidden="true" />
        <p className="t-caption chapter__label">{label}</p>
        <span className="chapter__tick" aria-hidden="true" />
        <span className="chapter__line" aria-hidden="true" />
      </div>
    </div>
  );
}
