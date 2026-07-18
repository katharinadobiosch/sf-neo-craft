import {useId} from 'react';

export function ProductShippingSection({
  title = 'Lead time + shipping',
  lines = [],
  idPrefix = 'ps-shipping',
  open = false,
  onToggle = () => {},
}) {
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
        onClick={onToggle}
      >
        <span className="pf-kv__key">{title}</span>
      </button>

      <div
        className="pf-kv__value-wrap"
        id={panelId}
        role="region"
        aria-label={title}
        hidden={!open}
      >
        <div className="pf-kv__value">
          {safeLines.length ? (
            <ul className="ps-lines">
              {safeLines.map((line, index) => (
                <li key={index} className="ps-line">
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
