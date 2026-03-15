import {useMemo, useState} from 'react';
import {ProductMetaAccordion} from '../ProductMetaAccordion';
import metaDefsJson from '~/graphql/product/product-metafield-defs.json';

const cx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

type Props = {
  mfMeasurements?: any[];
  mfOthers?: any[];
  product?: any;
};

type MetaDef = {
  namespace: string;
  key: string;
  name: string;
  type?: {name?: string};
  access?: {storefront?: 'PUBLIC_READ' | 'NONE' | string};
  ownerType?: 'PRODUCT' | string;
};

const RAW_DEFS: MetaDef[] = Array.isArray(metaDefsJson)
  ? (metaDefsJson as MetaDef[])
  : ((metaDefsJson as unknown as {productMetafieldDefsAll?: MetaDef[]})
      .productMetafieldDefsAll ?? []);

const LABEL_BY_KEY = Object.fromEntries(
  RAW_DEFS.filter(
    (d) => d.ownerType === 'PRODUCT' && d.access?.storefront === 'PUBLIC_READ',
  ).map((d) => [d.key, String(d.name || d.key).trim()]),
);

function prettifyKey(key: string) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function getLabel(m: any) {
  const key = String(m?.key || '').trim();
  if (!key) return '—';
  return LABEL_BY_KEY[key] || prettifyKey(key);
}

export function ProductDetailsSection({
  mfMeasurements = [],
  mfOthers = [],
  product,
}: Props) {
  const items = useMemo(() => {
    return [...(mfMeasurements || []), ...(mfOthers || [])].filter(Boolean);
  }, [mfMeasurements, mfOthers]);

  if (items.length === 0) return null;

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const m of items) {
      const k = String(m?.id || m?.key || getLabel(m));
      initial[k] = false;
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
