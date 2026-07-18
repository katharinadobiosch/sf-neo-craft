import {useId, useState} from 'react';

export function ProductShippingSection({
  title = 'Lead time + shipping',
  lines = [],
  idPrefix = 'ps-shipping',
}) {
  const [open, setOpen] = useState(false);

  const reactId = useId();
  const panelId = `${idPrefix}-${reactId}`;

  const safeLines = Array.isArray(lines) ? lines.filter(Boolean) : [];

  return (
    <div className="shipping-item pf-kv__row" data-open={open}>
      <button
        type="button"
        className="pf-kv__toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="pf-kv__key pf-kv__key--right">{title}</span>
      </button>

      <div
        className="pf-kv__value-wrap"
        id={panelId}
        role="region"
        aria-label={title}
      >
        <div className="pf-kv__value">
          {safeLines.length ? (
            <ul className="ps-lines">
              {safeLines.map((line, i) => (
                <li key={i} className="ps-line">
                  {line}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
