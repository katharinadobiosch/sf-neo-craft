// app/utils/metafields.ts

type RecordLike = Record<string, unknown>;

function isRecord(v: unknown): v is RecordLike {
  return typeof v === 'object' && v !== null;
}

type MetaobjectField = {key?: string; value?: string | null};

type MetaobjectLike = {
  __typename?: 'Metaobject';
  id?: string;
  handle?: string;
  fields?: MetaobjectField[];
};

function isMetaobjectLike(v: unknown): v is MetaobjectLike {
  if (!isRecord(v)) return false;
  // __typename kann fehlen, je nach Query; wir sind tolerant
  return true;
}

function labelFromMetaobject(metaobj: unknown): string {
  if (!isMetaobjectLike(metaobj)) return '';

  const fields = Array.isArray(metaobj.fields) ? metaobj.fields : [];
  const pick = (k: string): string | undefined =>
    fields.find((x) => x?.key === k)?.value ?? undefined;

  return pick('name') || pick('title') || metaobj.handle || metaobj.id || '';
}

type MediaImageRef = {
  __typename: 'MediaImage';
  image?: {
    url?: string;
    altText?: string | null;
    width?: number;
    height?: number;
  } | null;
};

function isMediaImageRef(v: unknown): v is MediaImageRef {
  return isRecord(v) && v.__typename === 'MediaImage';
}

type NormalizedMedia = {
  __typename: 'MediaImage';
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
} | null;

function mediaFromRef(ref: unknown): NormalizedMedia {
  if (!isMediaImageRef(ref)) return null;
  const img = ref.image;
  if (!img?.url) return null;

  return {
    __typename: 'MediaImage',
    url: img.url,
    altText: img.altText ?? null,
    width: img.width,
    height: img.height,
  };
}

type StorefrontReferences = {nodes?: unknown[]};
type StorefrontMetafield = {
  key?: string;
  namespace?: string;
  type?: string;
  value?: string | null;
  reference?: unknown;
  references?: StorefrontReferences | null;
};

export type NormalizedMetafield = {
  key?: string;
  namespace?: string;
  rawType?: string;
  kind?: string;
  value: unknown;
  list: unknown[] | null;
  refs: unknown[] | null;
  display: string | string[] | null;
  mf: StorefrontMetafield;
};

export function normalizeMetafield(mf: unknown): NormalizedMetafield | null {
  if (!isRecord(mf)) return null;

  const m: StorefrontMetafield = {
    key: typeof mf.key === 'string' ? mf.key : undefined,
    namespace: typeof mf.namespace === 'string' ? mf.namespace : undefined,
    type: typeof mf.type === 'string' ? mf.type : undefined,
    value:
      typeof mf.value === 'string' || mf.value === null
        ? (mf.value as string | null)
        : undefined,
    reference: mf.reference,
    references: isRecord(mf.references)
      ? (mf.references as StorefrontReferences)
      : null,
  };

  const rawType = m.type;
  const isList = rawType?.startsWith('list.') ?? false;
  const base = isList ? rawType?.slice(5) : rawType;

  const out: NormalizedMetafield = {
    key: m.key,
    namespace: m.namespace,
    rawType,
    kind: base,
    value: null,
    list: null,
    refs: null,
    display: null,
    mf: m,
  };

  const parseList = (): string[] => {
    const v = m.value;
    if (!v) return [];
    try {
      const arr = JSON.parse(v) as unknown;
      return Array.isArray(arr) ? arr.map(String) : [];
    } catch {
      return String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const refs: unknown[] =
    (Array.isArray(m.references?.nodes) && m.references?.nodes?.length
      ? m.references.nodes
      : []) || (m.reference ? [m.reference] : []);

  if (refs.length) out.refs = refs;

  switch (base) {
    case 'single_line_text_field':
    case 'multi_line_text_field': {
      if (isList) {
        const list = parseList();
        out.list = list;
        out.display = list;
      } else {
        const val = m.value ?? '';
        out.value = val;
        out.display = val;
      }
      break;
    }

    case 'number_integer':
    case 'number_decimal': {
      const toNum = (v: unknown): number | null => {
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
      };

      if (isList) {
        const list = parseList()
          .map(toNum)
          .filter((n): n is number => n !== null);
        out.list = list;
        out.display = list.map(String);
      } else {
        const n = toNum(m.value);
        out.value = n;
        out.display = n != null ? String(n) : '';
      }
      break;
    }

    case 'metaobject_reference': {
      if (isList) {
        const list = refs.filter(
          (r) => isRecord(r) && r.__typename === 'Metaobject',
        );
        out.list = list;
        out.display = list.map(labelFromMetaobject);
      } else {
        const one = refs[0];
        const mobj =
          isRecord(one) && one.__typename === 'Metaobject' ? one : null;
        out.value = mobj;
        out.display = mobj ? labelFromMetaobject(mobj) : '';
      }
      break;
    }

    case 'file_reference': {
      if (isList) {
        const imgs = refs
          .map(mediaFromRef)
          .filter((x): x is Exclude<NormalizedMedia, null> => Boolean(x));
        out.list = imgs;
        out.display = imgs.map((i) => i.url);
      } else {
        const img = mediaFromRef(refs[0]);
        out.value = img;
        out.display = img?.url ?? '';
      }
      break;
    }

    default: {
      if (isList) {
        const list = parseList();
        out.list = list;
        out.display = list.map(String);
      } else {
        const v = m.value ?? '';
        out.value = v;
        out.display = String(v);
      }
    }
  }

  return out;
}

export function normalizeMetafields(
  metafields: unknown,
): NormalizedMetafield[] {
  // edges -> nodes oder Array -> Array, sonst []
  if (isRecord(metafields) && Array.isArray(metafields.edges)) {
    const nodes = metafields.edges
      .map((e) => (isRecord(e) ? e.node : null))
      .filter(Boolean);
    return nodes
      .map(normalizeMetafield)
      .filter((x): x is NormalizedMetafield => Boolean(x));
  }

  if (Array.isArray(metafields)) {
    return metafields
      .filter(Boolean)
      .map(normalizeMetafield)
      .filter((x): x is NormalizedMetafield => Boolean(x));
  }

  return [];
}

export function normalizeAllMetafields(
  metafields: unknown,
): Record<string, NormalizedMetafield> {
  const arr = normalizeMetafields(metafields);
  const map: Record<string, NormalizedMetafield> = {};
  for (const n of arr) {
    if (n.key) map[n.key] = n;
  }
  return map;
}
