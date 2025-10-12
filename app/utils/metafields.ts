// --- Hilfen für Labels / Medien --------------------------------------------
function labelFromMetaobject(metaobj) {
  if (!metaobj) return '';
  const f = (k) => metaobj.fields?.find((x) => x.key === k)?.value;
  return f('name') || f('title') || metaobj.handle || metaobj.id || '';
}

function mediaFromRef(ref) {
  if (!ref) return null;
  if (ref.__typename === 'MediaImage') return ref.image || null;
  // Video/Model3d/GenericFile ggf. hier später mit abbilden
  return null;
}

// --- Kern: EIN Normalizer für EIN Metafield ---------------------------------
/**
 * Liefert ein einheitliches Objekt, egal ob Text/Number/Referenz/Liste.
 * Rückgabe-Form:
 * {
 *   key, namespace, rawType, kind,
 *   value,     // normierter Wert (string | number | object)
 *   list,      // normierte Liste (string[] | number[] | objects[])
 *   refs,      // Original-Referenzen (falls vorhanden)
 *   display,   // menschenlesbare Ausgabe (string | string[])
 * }
 */
export function normalizeMetafield(mf) {
  if (!mf) return null;

  const rawType = mf.type; // z.B. "list.metaobject_reference"
  const [isList, base] = rawType?.startsWith('list.')
    ? [true, rawType.slice(5)]
    : [false, rawType];

  const out = {
    key: mf.key,
    namespace: mf.namespace,
    rawType,
    kind: base, // z.B. "single_line_text_field" | "metaobject_reference" | "file_reference" | "number_decimal" | "multi_line_text_field"
    value: null,
    list: null,
    refs: null,
    display: null,
    mf, // original für Debug
  };

  // Hilfsparser für JSON-Listen aus value:
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
  const refs = mf.references?.nodes?.length
    ? mf.references.nodes
    : mf.reference
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
      const toNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };
      if (isList) {
        const list = parseList()
          .map(toNum)
          .filter((n) => n !== null);
        out.list = list; // number[]
        out.display = list.map((n) => String(n));
      } else {
        out.value = toNum(mf.value);
        out.display = out.value != null ? String(out.value) : '';
      }
      break;
    }

    case 'metaobject_reference': {
      if (isList) {
        const list = (refs || []).filter((r) => r.__typename === 'Metaobject');
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
        out.display = imgs.map((i) => i.url);
      } else {
        const img = mediaFromRef(refs[0]);
        out.value = img;
        out.display = img?.url || '';
      }
      break;
    }

    // Fallback – zeig raw value an
    default: {
      if (isList) {
        const list = parseList();
        out.list = list;
        out.display = list.map((x) => String(x));
      } else {
        out.value = mf.value ?? '';
        out.display = String(out.value);
      }
    }
  }

  return out;
}

/** Alle Metafelder auf einmal normalisieren → Map: key -> normalized */
export function normalizeAllMetafields(metafieldsList = []) {
  const map = {};
  for (const mf of metafieldsList.filter(Boolean)) {
    map[mf.key] = normalizeMetafield(mf);
  }
  return map;
}
