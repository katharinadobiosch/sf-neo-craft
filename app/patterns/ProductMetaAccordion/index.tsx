// app/patterns/ProductMetaAccordion/index.tsx
import {useMemo} from 'react';
import {normalizeMetafields} from '~/utils/metafields';
import metaDefsJson from '~/graphql/product/product-metafield-defs.json';

// ---- Typen ----
type MetaDef = {
  namespace: string;
  key: string;
  name: string;
  type?: {name?: string}; // z.B. "list.file_reference", "list.metaobject_reference"
  access?: {storefront?: 'PUBLIC_READ' | 'NONE' | string};
  ownerType?: 'PRODUCT' | string;
};

type NormalizedNode = {
  key?: string; // "metal_color" ODER "custom.metal_color"
  fqKey?: string; // "custom.metal_color"
  kind?: 'metaobject_reference' | 'file_reference' | 'text';
  display?: string | string[];
  list?: any[]; // für list.* Typen
};

// ---- Metafield-Definitionen vorbereiten ----
const RAW_DEFS: MetaDef[] = Array.isArray(metaDefsJson)
  ? (metaDefsJson as MetaDef[])
  : ((metaDefsJson as any).productMetafieldDefsAll ?? []);

const FIELD_CONFIG = RAW_DEFS.filter(
  (d) => d.ownerType === 'PRODUCT' && d.access?.storefront === 'PUBLIC_READ',
).map((d) => ({
  key: d.key,
  fqKey: `${d.namespace}.${d.key}`,
  label: d.name?.trim() || d.key,
  typeName: d.type?.name ?? '',
}));

// ---- Exclude-Liste (FQ-Keys!) ----
const EXCLUDE_FQ_KEYS = new Set<string>([
  'custom.product_tile',
  'custom.produkt_duo_top_links',
  'custom.produkt_duo_top_rechts',
  'custom.hero_split_links',
  'custom.hero_split_rechts',
  'custom.teaser_duo_bottom_links',
  'custom.teaser_duo_bottom_rechts',
]);

// ---- Hilfsfunktionen ----
function metaobjectListToText(n: NormalizedNode) {
  if (!n || !Array.isArray((n as any).list)) return '';
  const labelFor = (m: any) => {
    const pick = (k: string) => m?.fields?.find((x: any) => x.key === k)?.value;
    return (
      pick('label') || pick('name') || pick('title') || m?.handle || m?.id || ''
    );
  };
  return (n as any).list.map(labelFor).filter(Boolean).join(', ');
}

function fileRefListToImgs(
  n: NormalizedNode,
): Array<{url: string; altText?: string}> {
  const list = (n as any)?.list;
  if (!Array.isArray(list)) return [];
  // Shopify liefert i.d.R. { image { url, altText } } oder flach { url, altText }
  return list
    .map((m: any) => {
      const img = m?.image ?? m;
      const url: string | undefined = img?.url;
      if (!url) return null;
      return {url, altText: img?.altText};
    })
    .filter(Boolean) as Array<{url: string; altText?: string}>;
}

function coerceKind(
  n: NormalizedNode,
  defTypeName: string,
): NormalizedNode['kind'] {
  if (n?.kind) return n.kind;
  if (defTypeName.includes('metaobject_reference'))
    return 'metaobject_reference';
  if (defTypeName.includes('file_reference')) return 'file_reference';
  return 'text';
}

type BuiltItem =
  | {label: string; fqKey: string; type: 'text'; value: string}
  | {
      label: string;
      fqKey: string;
      type: 'images';
      images: Array<{url: string; altText?: string}>;
    };

function buildItems(normalizedArray: NormalizedNode[]) {
  const byKey = new Map<string, NormalizedNode>();
  for (const n of normalizedArray) {
    const k = n?.key ?? n?.fqKey;
    if (!k) continue;
    byKey.set(k, n);
  }

  const items: BuiltItem[] = [];

  for (const def of FIELD_CONFIG) {
    // Excludes frühzeitig abfangen
    if (EXCLUDE_FQ_KEYS.has(def.fqKey)) continue;

    // Sowohl "key" als auch "fqKey" probieren
    const n = byKey.get(def.key) || byKey.get(def.fqKey);
    if (!n) continue;

    const kind = coerceKind(n, def.typeName);

    if (kind === 'metaobject_reference') {
      const txt = metaobjectListToText(n);
      if (!txt.trim()) continue;
      items.push({
        label: def.label,
        fqKey: def.fqKey,
        type: 'text',
        value: txt,
      });
      continue;
    }

    if (kind === 'file_reference') {
      const imgs = fileRefListToImgs(n);
      if (!imgs.length) continue;
      items.push({
        label: def.label,
        fqKey: def.fqKey,
        type: 'images',
        images: imgs,
      });
      continue;
    }

    // Fallback: Text
    const raw = Array.isArray(n.display)
      ? n.display.filter(Boolean).join(', ')
      : (n.display ?? '');
    const val = String(raw ?? '').trim();
    if (!val) continue;
    items.push({label: def.label, fqKey: def.fqKey, type: 'text', value: val});
  }

  // Doppelte (gleiches Label) zu einem stabilen Satz reduzieren – bevorzugt Items mit Inhalt
  const byFqKey = new Map<string, BuiltItem>();
  for (const it of items) {
    // fqKey ist eindeutig – last write wins ist egal, da oben bereits gefiltert.
    byFqKey.set(it.fqKey, it);
  }

  return Array.from(byFqKey.values());
}

// ---- Component ----
export function ProductMetaAccordion({
  metafields,
  product,
}: {
  metafields: any;
  product?: any;
}) {
  const normalized: NormalizedNode[] = useMemo(
    () => normalizeMetafields(metafields ?? []),
    [metafields],
  );

  const items = useMemo(() => buildItems(normalized), [normalized]);

  const visibleItems = useMemo(() => {
    // Nur Items mit realem Inhalt behalten
    return items.filter((item) => {
      if (item.type === 'text') return Boolean(item.value?.trim());
      if (item.type === 'images')
        return Array.isArray(item.images) && item.images.length > 0;
      return false;
    });
  }, [items]);

  if (!visibleItems.length) return null;

  // Bildanzahl für Layout (optional, nur wenn "Measurements" vorhanden)
  const imageCount =
    (
      visibleItems.find((it) => it.label === 'Measurements') as
        | Extract<BuiltItem, {type: 'images'}>
        | undefined
    )?.images?.length ?? 0;

  return (
    <div className="meta-accordion" role="region" aria-label="Product details">
      {visibleItems.map((item) => (
        <details key={item.fqKey} className="acc-item">
          <summary>
            <span className="acc-title">{item.label}</span>
            <span className="acc-plus" aria-hidden />
          </summary>

          <div className="acc-panel">
            {item.type === 'text' && (
              <p style={{whiteSpace: 'pre-line'}}>{item.value}</p>
            )}
            {item.type === 'images' &&
              item.images?.length > 0 &&
              (() => {
                const isMeasurements =
                  /measure/i.test(item.label) ||
                  item.fqKey === 'custom.measurements';

                if (isMeasurements) {
                  return (
                    <div
                      className="acc-images measurements"
                      role="group"
                      aria-label={item.label}
                    >
                      <div className="m-grid" data-count={item.images.length}>
                        {item.images.map((img, i) => (
                          <figure className="m-fig" key={`${item.fqKey}-${i}`}>
                            <img
                              src={img.url}
                              alt={img.altText?.trim() || item.label}
                              loading="lazy"
                              decoding="async"
                            />
                            {img.altText && (
                              <figcaption className="m-cap">
                                {img.altText}
                              </figcaption>
                            )}
                          </figure>
                        ))}
                      </div>
                    </div>
                  );
                }

                // Default-Bildliste (unverändert)
                return (
                  <div
                    className="acc-images"
                    role="group"
                    aria-label={item.label}
                  >
                    {item.images.map((img, i) => (
                      <img
                        key={`${item.fqKey}-${i}`}
                        src={img.url}
                        alt={img.altText?.trim() || item.label}
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: imageCount
                            ? `calc(100% / ${imageCount})`
                            : '100%',
                          height: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    ))}
                  </div>
                );
              })()}
          </div>
        </details>
      ))}
    </div>
  );
}
