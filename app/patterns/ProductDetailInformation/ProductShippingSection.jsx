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
    <div className="shipping-item" data-open={open}>
      <button
        type="button"
        className="ps-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ps-title">{title}</span>
        <span
          className={`ps-plus ${open ? 'is-open' : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        className="ps-panel **ps-panel--scroll**"
        id={panelId}
        role="region"
        aria-label={title}
      >
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
  );
}
