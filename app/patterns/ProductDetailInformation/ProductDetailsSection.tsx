import {useMemo, useState} from 'react';
import {ProductMetaAccordion} from '../ProductMetaAccordion';

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

type Props = {
  mfMeasurements?: any[];
  mfOthers?: any[];
  product?: any;
};

function getLabel(m: any) {
  return m?.name || m?.definition?.name || m?.key || m?.namespace || '—';
}

export function ProductDetailsSection({
  mfMeasurements = [],
  mfOthers = [],
  product,
}: Props) {
  const items = useMemo(() => {
    // wie vorher: measurements + others zusammen
    return [...(mfMeasurements || []), ...(mfOthers || [])].filter(Boolean);
  }, [mfMeasurements, mfOthers]);

  if (items.length === 0) return null;

  // pro Item eigener Toggle (default: offen)
  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of items) {
      const k = String(m?.id || m?.key || getLabel(m));
      initial[k] = true;
    }
    return initial;
  });

  const toggle = (k: string) => {
    setOpenMap((prev) => ({...prev, [k]: !prev[k]}));
  };

  return (
    <section className="pf-section pf-kv">
      <div className="pf-kv__list">
        {items.map((m) => {
          const k = String(m?.id || m?.key || getLabel(m));
          const label = getLabel(m);
          const isOpen = !!openMap[k];

          return (
            <div className="pf-kv__row" key={k} data-open={isOpen}>
              {/* Toggle: klickbar über Key + Icon */}
              <button
                type="button"
                className="pf-kv__toggle"
                onClick={() => toggle(k)}
                aria-expanded={isOpen}
              >
                <span className="pf-kv__key">{label}</span>
                <span
                  className={cx('pf-kv__icon', isOpen && 'is-open')}
                  aria-hidden="true"
                />
              </button>

              {/* Value */}
              <div className="pf-kv__value-wrap">
                <div className="pf-kv__value">
                  <ProductMetaAccordion metafields={[m]} product={product} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
