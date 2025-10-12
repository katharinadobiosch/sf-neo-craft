import {normalizeMetafields} from '~/utils/metafields';

// --- Label-Konfig pro Key (kannst du jederzeit erweitern) ---
const FIELD_CONFIG = [
  {key: 'metal_color', label: 'Metal Colour'},
  {key: 'cable_color', label: 'Cable Colour'},
  {key: 'frame_color', label: 'Frame Colour'},
  {key: 'glass_color', label: 'Glass Colour'},
  {key: 'neo_color_product', label: 'Available Colours'},
  {key: 'measurements', label: 'Measurements'}, // file_reference (Bilder)
  {key: 'product_tile', label: 'Product Tile'}, // file_reference (Bilder)
];

// Hilfsfunktionen zum Formatieren aus den normalisierten Werten:
function metaobjectListToText(n) {
  // bevorzugt "label" (deine Daten), fallback auf handle
  const get = (m) => {
    const f = (k) => m?.fields?.find((x) => x.key === k)?.value;
    return f('label') || f('name') || f('title') || m?.handle || m?.id || '';
  };
  return (n.list || []).map(get).filter(Boolean).join(', ');
}

function fileRefListToImgs(n) {
  // n.list enthält schon {url, altText, width, height}
  return Array.isArray(n.list) ? n.list : [];
}

/** Baut aus den normalisierten Metafeldern die Anzeigen-Items fürs UI */
function buildItems(normalizedArray) {
  // Map für schnellen Zugriff per key
  const byKey = new Map();
  for (const n of normalizedArray) if (n?.key) byKey.set(n.key, n);

  const items = [];

  for (const def of FIELD_CONFIG) {
    const n = byKey.get(def.key);
    if (!n) continue;

    // je nach Typ unterschiedlich rendern/formatieren
    if (n.kind === 'metaobject_reference') {
      const txt = metaobjectListToText(n);
      if (!txt) continue;
      items.push({
        label: def.label,
        type: 'text',
        value: txt,
      });
    } else if (n.kind === 'file_reference') {
      const imgs = fileRefListToImgs(n);
      if (!imgs.length) continue;
      items.push({
        label: def.label,
        type: 'images',
        images: imgs,
      });
    } else {
      // Text/Number/Fallback
      const val = Array.isArray(n.display)
        ? n.display.filter(Boolean).join(', ')
        : (n.display ?? '');
      if (!String(val).trim()) continue;
      items.push({
        label: def.label,
        type: 'text',
        value: String(val),
      });
    }
  }

  return items;
}

/** @param {{ metafields: any, product?: any }} props */
export function ProductMetaAccordion({metafields, product}) {
  // 1) normalisieren (edges/array -> array normalisierter Einträge)
  const normalized = normalizeMetafields(metafields);
  // 2) in UI-Items überführen
  const items = buildItems(normalized);

  if (!items.length) return null;

  return (
    <div className="meta-accordion" role="region" aria-label="Product details">
      {items.map((it) => (
        <details key={it.label} className="acc-item">
          <summary>
            <span className="acc-title">{it.label}</span>
            <span className="acc-plus" aria-hidden />
          </summary>

          <div className="acc-panel">
            {it.type === 'text' && <p>{it.value}</p>}

            {it.type === 'images' && (
              <div className="acc-images">
                {it.images.map((img, i) => (
                  <img
                    key={`${it.label}-${i}`}
                    src={img.url}
                    alt={img.altText || it.label}
                    loading="lazy"
                  />
                ))}
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
