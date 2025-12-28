// app/utils/metafields.ts

// --- Hilfen für Labels / Medien --------------------------------------------
type MetaobjectField = {
  key?: string;
  value?: string | null;
};

type MetaobjectLike = {
  id?: string;
  handle?: string;
  fields?: MetaobjectField[];
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isMetaobjectLike(v: unknown): v is MetaobjectLike {
  if (!isRecord(v)) return false;
  // fields kann fehlen, deshalb nur Objektcheck
  return true;
}

function labelFromMetaobject(metaobj: unknown): string {
  if (!isMetaobjectLike(metaobj)) return '';

  const fields = metaobj.fields ?? [];

  const f = (k: string): string | undefined => {
    const hit = fields.find((x) => x?.key === k)?.value;
    return hit ?? undefined;
  };

  return f('name') || f('title') || metaobj.handle || metaobj.id || '';
}

type MediaOut =
  | {
      __typename: 'MediaImage';
      url: string;
      altText?: string | null;
      width?: number;
      height?: number;
    }
  | {
      __typename: 'Video' | 'Model3d' | 'GenericFile';
      url: string;
      mimeType?: string | null;
    };

function mediaFromRef(ref: unknown): MediaOut | null {
  if (!isRecord(ref)) return null;

  const typename = ref.__typename;
  if (typeof typename !== 'string') return null;

  if (typename === 'MediaImage') {
    const image = (ref as {image?: unknown}).image;
    if (!isRecord(image)) return null;
    const url = image.url;
    if (typeof url !== 'string' || !url) return null;

    return {
      __typename: 'MediaImage',
      url,
      altText:
        typeof image.altText === 'string'
          ? image.altText
          : (image.altText as string | null | undefined),
      width: typeof image.width === 'number' ? image.width : undefined,
      height: typeof image.height === 'number' ? image.height : undefined,
    };
  }

  if (typename === 'Video' || typename === 'Model3d') {
    const sources = (ref as {sources?: unknown}).sources;
    const first = Array.isArray(sources) ? sources[0] : null;
    if (!isRecord(first)) return null;

    const url = first.url;
    if (typeof url !== 'string' || !url) return null;

    const mimeType =
      typeof first.mimeType === 'string'
        ? first.mimeType
        : (first.mimeType as string | null | undefined);

    return {__typename: typename, url, mimeType};
  }

  if (typename === 'GenericFile') {
    const url = ref.url;
    if (typeof url !== 'string' || !url) return null;

    const mimeType =
      typeof ref.mimeType === 'string'
        ? ref.mimeType
        : (ref.mimeType as string | null | undefined);

    return {__typename: 'GenericFile', url, mimeType};
  }

  return null;
}

// --- Kern: EIN Normalizer für EIN Metafield ---------------------------------
type MetafieldLike = {
  key?: string;
  namespace?: string;
  type?: string;
  value?: string | null;

  reference?: unknown | null;
  references?: {nodes?: unknown[]} | null;

  // optional edges form
  edges?: unknown;
};

type NormalizedMetafield = {
  key?: string;
  namespace?: string;
  rawType?: string;
  kind?: string;
  value: unknown;
  list: unknown[] | null;
  refs: unknown[] | null;
  display: string | string[] | null;
  mf: unknown;
};

export function normalizeMetafield(mf: unknown): NormalizedMetafield | null {
  if (!isRecord(mf)) return null;
  const m = mf as MetafieldLike;

  const rawType = typeof m.type === 'string' ? m.type : undefined;
  const isList = !!rawType?.startsWith('list.');
  const base = isList ? rawType!.slice(5) : rawType;

  const out: NormalizedMetafield = {
    key: m.key,
    namespace: m.namespace,
    rawType,
    kind: base,
    value: null,
    list: null,
    refs: null,
    display: null,
    mf,
  };

  const parseList = (): unknown[] => {
    const v = m.value;
    if (!v) return [];
    try {
      const arr = JSON.parse(v);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return String(v)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
  };

  const refs: unknown[] = m?.references?.nodes?.length
    ? (m.references.nodes as unknown[])
    : m?.reference
      ? [m.reference]
      : [];

  if (refs.length) out.refs = refs;

  switch (base) {
    case 'single_line_text_field':
    case 'multi_line_text_field': {
      if (isList) {
        const list = parseList().map((x) => String(x));
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
        const num = toNum(m.value);
        out.value = num;
        out.display = num != null ? String(num) : '';
      }
      break;
    }

    case 'metaobject_reference': {
      const onlyMetaobjects = (refs ?? []).filter(
        (r) => isRecord(r) && r.__typename === 'Metaobject',
      );

      if (isList) {
        out.list = onlyMetaobjects;
        out.display = onlyMetaobjects.map(labelFromMetaobject);
      } else {
        const one = onlyMetaobjects[0] ?? null;
        out.value = one;
        out.display = one ? labelFromMetaobject(one) : '';
      }
      break;
    }

    case 'file_reference': {
      if (isList) {
        const medias = (refs ?? [])
          .map(mediaFromRef)
          .filter((x): x is MediaOut => x !== null);

        out.list = medias;
        out.display = medias.map((m) => m.url);
      } else {
        const media = mediaFromRef(refs?.[0]);
        out.value = media;
        out.display = media?.url ?? '';
      }
      break;
    }

    default: {
      if (isList) {
        const list = parseList();
        out.list = list;
        out.display = list.map((x) => String(x));
      } else {
        const val = m.value ?? '';
        out.value = val;
        out.display = String(val);
      }
    }
  }

  return out;
}

export function normalizeMetafields(
  metafields: unknown,
): NormalizedMetafield[] {
  if (!metafields) return [];

  // edges -> nodes
  if (isRecord(metafields) && Array.isArray((metafields as any).edges)) {
    const edges = (metafields as any).edges as Array<{node?: unknown}>;
    return edges
      .map((e) => e?.node)
      .filter(Boolean)
      .map(normalizeMetafield)
      .filter(Boolean) as NormalizedMetafield[];
  }

  if (Array.isArray(metafields)) {
    return metafields
      .filter(Boolean)
      .map(normalizeMetafield)
      .filter(Boolean) as NormalizedMetafield[];
  }

  return [];
}

export function normalizeAllMetafields(metafields: unknown) {
  const arr = normalizeMetafields(metafields);
  const map: Record<string, NormalizedMetafield> = {};
  for (const n of arr) {
    if (n?.key) map[n.key] = n;
  }
  return map;
}
