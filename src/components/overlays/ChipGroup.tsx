'use client';

type Props = {
  legend: string;
  name: string;
  type: 'radio' | 'checkbox';
  options: string[];
  value: string | string[];
  onChange: (v: string | string[]) => void;
  autoFocusFirst?: boolean;
};

/** Real radio/checkbox inputs inside a fieldset with a legend, styled as chips (§11). */
export function ChipGroup({ legend, name, type, options, value, onChange, autoFocusFirst }: Props) {
  const selected = Array.isArray(value) ? value : value ? [value] : [];
  return (
    <fieldset className="field field--chips">
      <legend className="field__label">{legend}</legend>
      <div className="chip-options">
        {options.map((o, i) => {
          const checked = selected.includes(o);
          return (
            <label key={o} className="chip-option">
              <input
                type={type}
                name={name}
                value={o}
                checked={checked}
                data-autofocus={autoFocusFirst && i === 0 ? '' : undefined}
                onChange={(e) => {
                  if (type === 'radio') onChange(o);
                  else onChange(e.target.checked ? [...selected, o] : selected.filter((s) => s !== o));
                }}
              />
              <span>{o}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
