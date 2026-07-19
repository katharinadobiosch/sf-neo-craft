/* eslint-disable @typescript-eslint/no-explicit-any */
import {useMemo} from 'react';
import {normalizeMetafields} from '~/utils/metafields';
import metaDefsJson from '~/graphql/product/product-metafield-defs.json';

type MetaDef = {
  namespace: string;
  key: string;
  name: string;
  type?: {name?: string};
  access?: {storefront?: 'PUBLIC_READ' | 'NONE' | string};
  ownerType?: 'PRODUCT' | string;
};

type NormalizedNode = {
  key?: string;
  fqKey?: string;
  kind?: string;
  display?: string | string[];
  list?: unknown[];
};

const RAW_DEFS: MetaDef[] = Array.isArray(metaDefsJson)
  ? (metaDefsJson as MetaDef[])
  : ((metaDefsJson as unknown as {productMetafieldDefsAll?: MetaDef[]})
      .productMetafieldDefsAll ?? []);

const FIELD_CONFIG = RAW_DEFS.filter(
  (d) => d.ownerType === 'PRODUCT' && d.access?.storefront === 'PUBLIC_READ',
).map((d) => ({
  key: d.key,
  fqKey: `${d.namespace}.${d.key}`,
  label: d.name?.trim() || d.key,
  typeName: d.type?.name ?? '',
}));

const EXCLUDE_FQ_KEYS = new Set<string>([
  'custom.tile_images',
  'custom.duo_top_left_images',
  'custom.duo_top_right_images',
  'custom.hero_left_images',
  'custom.hero_right_images',
  'custom.teaser_bottom_left_images',
  'custom.teaser_bottom_right_images',
  'custom.material_tile_color',
]);

function metaobjectListToText(n: NormalizedNode) {
  const list = n.list;
  if (!Array.isArray(list)) return '';

  const labelFor = (m: unknown) => {
    const obj = m as any;
    const pick = (k: string) =>
      obj?.fields?.find((x: any) => x.key === k)?.value;

    return (
      pick('label') ||
      pick('name') ||
      pick('title') ||
      obj?.handle ||
      obj?.id ||
      ''
    );
  };

  return list.map(labelFor).filter(Boolean).join(', ');
}

function fileRefListToImgs(
  n: NormalizedNode,
): Array<{url: string; altText?: string}> {
  const list = n.list;
  if (!Array.isArray(list)) return [];

  return list
    .map((m: unknown) => {
      const obj = m as any;

      if (typeof obj?.url === 'string' && obj.url) {
        return {url: obj.url, altText: obj.altText};
      }

      if (typeof obj?.image?.url === 'string' && obj.image.url) {
        return {url: obj.image.url, altText: obj.image.altText};
      }

      return null;
    })
    .filter(Boolean) as Array<{url: string; altText?: string}>;
}

function fileRefListToFiles(
  n: NormalizedNode,
): Array<{url: string; label: string}> {
  const list = n.list;
  if (!Array.isArray(list)) return [];

  return list
    .map((m: unknown, index: number) => {
      const obj = m as any;

      const url = obj?.url || obj?.image?.url || obj?.sources?.[0]?.url || null;

      if (!url) return null;

      const label =
        obj?.filename || obj?.name || obj?.altText || `Download ${index + 1}`;

      return {url, label};
    })
    .filter(Boolean) as Array<{url: string; label: string}>;
}

function coerceKind(
  n: NormalizedNode,
  defTypeName: string,
): 'metaobject_reference' | 'file_reference' | 'text' {
  if (
    n.kind === 'metaobject_reference' ||
    n.kind === 'file_reference' ||
    n.kind === 'text'
  ) {
    return n.kind;
  }

  if (defTypeName.includes('metaobject_reference')) {
    return 'metaobject_reference';
  }

  if (defTypeName.includes('file_reference')) {
    return 'file_reference';
  }

  return 'text';
}

type LinkItem = {
  url: string;
  label: string;
};

type BuiltItem =
  | {label: string; fqKey: string; type: 'text'; value: string}
  | {
      label: string;
      fqKey: string;
      type: 'images';
      images: Array<{url: string; altText?: string}>;
    }
  | {
      label: string;
      fqKey: string;
      type: 'files';
      files: LinkItem[];
    }
  | {
      label: string;
      fqKey: string;
      type: 'links';
      links: LinkItem[];
    };

function parseDownloadLinks(n: NormalizedNode): LinkItem[] {
  const values = Array.isArray(n.display)
    ? n.display
    : Array.isArray(n.list)
      ? n.list.map(String)
      : [];

  return values
    .map((entry) => {
      const raw = String(entry ?? '').trim();
      const separatorIndex = raw.indexOf('::');

      if (separatorIndex === -1) return null;

      const label = raw.slice(0, separatorIndex).trim();
      const url = raw.slice(separatorIndex + 2).trim();

      if (!label || !/^https?:\/\//i.test(url)) return null;

      return {label, url};
    })
    .filter((item): item is LinkItem => Boolean(item));
}

function buildItems(normalizedArray: NormalizedNode[]) {
  const byKey = new Map<string, NormalizedNode>();

  for (const n of normalizedArray) {
    const k = n.key ?? n.fqKey;
    if (!k) continue;
    byKey.set(k, n);
  }

  const items: BuiltItem[] = [];

  for (const def of FIELD_CONFIG) {
    if (EXCLUDE_FQ_KEYS.has(def.fqKey)) continue;

    const label = String(def.label ?? '').trim();
    if (!label) continue;

    const n = byKey.get(def.key) || byKey.get(def.fqKey);
    if (!n) continue;

    const kind = coerceKind(n, def.typeName);

    if (def.key === 'download_links') {
      const links = parseDownloadLinks(n);

      if (!links.length) continue;

      items.push({
        label,
        fqKey: def.fqKey,
        type: 'links',
        links,
      });

      continue;
    }

    if (kind === 'metaobject_reference') {
      const txt = metaobjectListToText(n);
      if (!txt.trim()) continue;
      items.push({
        label,
        fqKey: def.fqKey,
        type: 'text',
        value: txt,
      });
      continue;
    }

    if (kind === 'file_reference') {
      if (def.key === 'download') {
        const files = fileRefListToFiles(n);
        if (!files.length) continue;

        items.push({
          label,
          fqKey: def.fqKey,
          type: 'files',
          files,
        });
        continue;
      }

      const imgs = fileRefListToImgs(n);
      if (!imgs.length) continue;

      items.push({
        label,
        fqKey: def.fqKey,
        type: 'images',
        images: imgs,
      });
      continue;
    }

    const raw = Array.isArray(n.display)
      ? n.display.filter(Boolean).join(', ')
      : (n.display ?? '');

    const val = String(raw ?? '').trim();
    if (!val) continue;

    items.push({label, fqKey: def.fqKey, type: 'text', value: val});
  }

  const byFqKey = new Map<string, BuiltItem>();
  for (const it of items) byFqKey.set(it.fqKey, it);
  return Array.from(byFqKey.values());
}

export function ProductMetaAccordion({
  metafields,
}: {
  metafields: unknown[];
  product?: unknown;
}) {
  const normalized = useMemo(
    () => normalizeMetafields((metafields ?? []) as any) as NormalizedNode[],
    [metafields],
  );

  const items = useMemo(() => buildItems(normalized), [normalized]);

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (!String(item.label ?? '').trim()) return false;
      if (item.type === 'text') return Boolean(item.value?.trim());
      if (item.type === 'images') {
        return Array.isArray(item.images) && item.images.length > 0;
      }
      if (item.type === 'files') {
        return Array.isArray(item.files) && item.files.length > 0;
      }
      if (item.type === 'links') {
        return Array.isArray(item.links) && item.links.length > 0;
      }
      return false;
    });
  }, [items]);

  if (!visibleItems.length) return null;

  return (
    <>
      {Array.isArray(metafields) && metafields.length > 0 ? (
        <div
          className="meta-accordion"
          role="region"
          aria-label="Product details"
        >
          {visibleItems.map((item) => (
            <div key={item.fqKey} className="acc-item">
              <div className="acc-panel">
                {item.type === 'text' && (
                  <p style={{whiteSpace: 'pre-line'}}>{item.value}</p>
                )}

                {item.type === 'images' && item.images?.length > 0 && (
                  <div
                    className={`acc-images ${
                      /measure/i.test(item.label) ||
                      item.fqKey === 'custom.measurements'
                        ? 'measurements'
                        : ''
                    }`}
                    role="group"
                    aria-label={item.label}
                  >
                    <div
                      className="meta-accordion__images-grid"
                      data-count={item.images.length}
                    >
                      {item.images.map((img, i) => (
                        <figure
                          className="meta-accordion__images-figure"
                          key={`${item.fqKey}-${i}`}
                        >
                          <div className="meta-accordion__images-media">
                            <img
                              src={img.url}
                              alt={img.altText?.trim() || item.label}
                              loading="lazy"
                              decoding="async"
                            />
                          </div>

                          {img.altText && (
                            <figcaption className="m-cap">
                              {img.altText}
                            </figcaption>
                          )}
                        </figure>
                      ))}
                    </div>
                  </div>
                )}

                {item.type === 'files' && item.files?.length > 0 && (
                  <ul className="meta-accordion__file-list">
                    {item.files.map((file, i) => (
                      <li key={`${item.fqKey}-${i}`}>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {file.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
                {item.type === 'links' && item.links.length > 0 && (
                  <ul className="meta-accordion__file-list">
                    {item.links.map((link, index) => (
                      <li key={`${item.fqKey}-${index}`}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}
