import {useMemo, useState} from 'react';
import {ProductMetaAccordion} from '../ProductMetaAccordion';
import metaDefsJson from '~/graphql/product/product-metafield-defs.json';

type Props = {
  mfMeasurements?: any[];
  mfOthers?: any[];
  product?: any;
};

type MetaDef = {
  namespace: string;
  key: string;
  name: string;
  type?: {
    name?: string;
  };
  access?: {
    storefront?: 'PUBLIC_READ' | 'NONE' | string;
  };
  ownerType?: 'PRODUCT' | string;
};

const RAW_DEFS: MetaDef[] = Array.isArray(metaDefsJson)
  ? (metaDefsJson as MetaDef[])
  : ((
      metaDefsJson as unknown as {
        productMetafieldDefsAll?: MetaDef[];
      }
    ).productMetafieldDefsAll ?? []);

const LABEL_BY_KEY = Object.fromEntries(
  RAW_DEFS.filter(
    (definition) =>
      definition.ownerType === 'PRODUCT' &&
      definition.access?.storefront === 'PUBLIC_READ',
  ).map((definition) => [
    definition.key,
    String(definition.name || definition.key).trim(),
  ]),
);

function prettifyKey(key: string) {
  return String(key || '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
    .trim();
}

function getLabel(metafield: any) {
  const key = String(metafield?.key || '').trim();

  if (!key) return '—';

  return LABEL_BY_KEY[key] || prettifyKey(key);
}

function getItemKey(metafield: any) {
  return String(metafield?.id || metafield?.key || getLabel(metafield));
}

export function ProductDetailsSection({
  mfMeasurements = [],
  mfOthers = [],
  product,
}: Props) {
  const items = useMemo(
    () => [...mfMeasurements, ...mfOthers].filter(Boolean),
    [mfMeasurements, mfOthers],
  );

  const [openKey, setOpenKey] = useState<string | null>(null);

  if (items.length === 0) return null;

  const toggle = (key: string) => {
    setOpenKey((currentKey) => (currentKey === key ? null : key));
  };

  return (
    <section className="pf-section pf-kv">
      <div className="pf-kv__list">
        {items.map((metafield) => {
          const key = getItemKey(metafield);
          const label = getLabel(metafield);
          const isOpen = openKey === key;
          const panelId = `product-detail-${key.replace(
            /[^a-zA-Z0-9_-]/g,
            '-',
          )}`;

          return (
            <div className="pf-kv__row" key={key} data-open={isOpen}>
              <button
                type="button"
                className="pf-kv__toggle"
                onClick={() => toggle(key)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span className="pf-kv__key">{label}</span>
              </button>

              <div id={panelId} className="pf-kv__value-wrap" hidden={!isOpen}>
                <div className="pf-kv__value">
                  <ProductMetaAccordion
                    metafields={[metafield]}
                    product={product}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
