// --- Hilfen für Labels / Medien --------------------------------------------
function labelFromMetaobject(metaobj: any) {
  if (!metaobj) return '';
  const f = (k: string) => metaobj.fields?.find((x: any) => x.key === k)?.value;
  return f('name') || f('title') || metaobj.handle || metaobj.id || '';
}

function mediaFromRef(ref: any) {
  if (!ref) return null;

  if (ref.__typename === 'MediaImage') return ref.image || null;

  if (ref.__typename === 'Video') {
    const s = ref.sources?.[0];
    return s?.url
      ? {__typename: 'Video', url: s.url, mimeType: s.mimeType}
      : null;
  }

  if (ref.__typename === 'Model3d') {
    const s = ref.sources?.[0];
    return s?.url
      ? {__typename: 'Model3d', url: s.url, mimeType: s.mimeType}
      : null;
  }

  if (ref.__typename === 'GenericFile') {
    return ref.url
      ? {__typename: 'GenericFile', url: ref.url, mimeType: ref.mimeType}
      : null;
  }

  return null;
}

// --- Kern: EIN Normalizer für EIN Metafield ---------------------------------
/**
 * Einheitliches Objekt – unabhängig von Text/Number/Referenz/Liste.
 * {
 *   key, namespace, rawType, kind,
 *   value,     // normalisierter Einzelwert (string | number | object)
 *   list,      // normalisierte Liste (string[] | number[] | objects[])
 *   refs,      // Original-Referenzen (falls vorhanden)
 *   display,   // menschenlesbare Ausgabe (string | string[])
 *   mf,        // Original (debug)
 * }
 */
export function normalizeMetafield(mf: any) {
  if (!mf) return null;

  const rawType = mf.type as string | undefined; // z.B. "list.metaobject_reference"
  const [isList, base] = rawType?.startsWith('list.')
    ? [true, rawType.slice(5)]
    : [false, rawType];

  const out: any = {
    key: mf.key,
    namespace: mf.namespace,
    rawType,
    kind: base, // "single_line_text_field" | "metaobject_reference" | "file_reference" | "number_decimal" | "multi_line_text_field" | ...
    value: null,
    list: null,
    refs: null,
    display: null,
    mf, // original
  };

  // Hilfsparser für JSON-ähnliche Listen aus mf.value (nur für text/number sinnvoll)
  const parseList = () => {
    if (!mf.value) return [];
    try {
      const arr = JSON.parse(mf.value);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return String(mf.value)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  // Referenzen einsammeln (singular/list)
  const refs = mf?.references?.nodes?.length
    ? mf.references.nodes
    : mf?.reference
      ? [mf.reference]
      : [];
  if (refs.length) out.refs = refs;

  // Routing nach Typ
  switch (base) {
    case 'single_line_text_field':
    case 'multi_line_text_field': {
      if (isList) {
        const list = parseList(); // string[]
        out.list = list;
        out.display = list;
      } else {
        out.value = mf.value ?? '';
        out.display = out.value;
      }
      break;
    }

    case 'number_integer':
    case 'number_decimal': {
      const toNum = (v: any) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      if (isList) {
        const list = parseList()
          .map(toNum)
          .filter((n: number | null) => n !== null);
        out.list = list; // number[]
        out.display = list.map((n: number) => String(n));
      } else {
        out.value = toNum(mf.value);
        out.display = out.value != null ? String(out.value) : '';
      }
      break;
    }

    case 'metaobject_reference': {
      if (isList) {
        const list = (refs || []).filter(
          (r: any) => r.__typename === 'Metaobject',
        );
        out.list = list; // Metaobject[]
        out.display = list.map(labelFromMetaobject);
      } else {
        const m =
          refs[0] && refs[0].__typename === 'Metaobject' ? refs[0] : null;
        out.value = m;
        out.display = m ? labelFromMetaobject(m) : '';
      }
      break;
    }

    case 'file_reference': {
      if (isList) {
        const imgs = (refs || []).map(mediaFromRef).filter(Boolean);
        out.list = imgs; // {url, altText, ...}[]
        out.display = imgs.map((i: any) => i.url);
      } else {
        const img = mediaFromRef(refs[0]);
        out.value = img;
        out.display = img?.url || '';
      }
      break;
    }

    // Fallback – rohen value ausgeben
    default: {
      if (isList) {
        const list = parseList();
        out.list = list;
        out.display = list.map((x: any) => String(x));
      } else {
        out.value = mf.value ?? '';
        out.display = String(out.value);
      }
    }
  }

  return out;
}

/** Alle Metafelder normalisieren → Array normalisierter Einträge */
export function normalizeMetafields(metafields: any) {
  // edges -> nodes oder Array -> Array, sonst []
  const flat = Array.isArray(metafields?.edges)
    ? metafields.edges.map((e: any) => e?.node).filter(Boolean)
    : Array.isArray(metafields)
      ? metafields.filter(Boolean)
      : [];
  return flat.map((mf: any) => normalizeMetafield(mf));
}

/** Optional: Map { key -> normalized } (praktisch für direkten Zugriff per Key) */
export function normalizeAllMetafields(metafields: any) {
  const arr = normalizeMetafields(metafields);
  const map: Record<string, any> = {};
  for (const n of arr) {
    if (n?.key) map[n.key] = n;
  }
  return map;
}
