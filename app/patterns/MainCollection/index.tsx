/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';
import {normalizeAllMetafields} from '~/utils/metafields';

type SeriesField = {
  key: string;
  value?: string | null;
  references?: {
    nodes?: Array<
      | {__typename?: 'MediaImage'; image?: any | null}
      | {
          __typename?: 'GenericFile';
          url?: string | null;
          mimeType?: string | null;
        }
      | null
    > | null;
  } | null;
};

type MetaobjectRef = {
  __typename: 'Metaobject';
  handle?: string | null;
  type?: string | null;
  fields?: SeriesField[] | null;
  seriesTitle?: {value?: string | null} | null;
  productTile?: {
    value?: string | null;
    references?: {
      nodes?: Array<
        | {__typename?: 'MediaImage'; image?: any | null}
        | {
            __typename?: 'GenericFile';
            url?: string | null;
            mimeType?: string | null;
          }
        | null
      > | null;
    } | null;
  } | null;
};

type ProductLike = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: unknown | null;

  metafieldSeries?: {
    reference?: MetaobjectRef | {__typename?: string} | null;
  } | null;

  metafields?: Array<{
    namespace?: string | null;
    key?: string | null;
    type?: string | null;
    references?: {
      nodes?: Array<
        | {__typename?: 'MediaImage'; image?: unknown | null}
        | {__typename?: 'GenericFile'; url?: string | null}
        | null
      > | null;
    } | null;
  }> | null;

  seriesMeta?: {
    title: string | null;
    intro: string | null;
    hero_links: string[];
    hero_rechts: string[];
    produkt_tile: string[];
  } | null;
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

function norm(value: unknown) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

function refToUrl(node: any): string | null {
  if (!node) return null;

  if (node.__typename === 'MediaImage') return node.image?.url ?? null;
  if (node.__typename === 'GenericFile') return node.url ?? null;

  return (
    node.url ??
    node.image?.url ??
    node.previewImage?.url ??
    node.preview?.image?.url ??
    node.preview?.url ??
    node.sources?.[0]?.url ??
    null
  );
}

function buildSeriesMetaFromFields(fields: any[] = []) {
  const getField = (key: string) =>
    fields.find((f) => norm(f?.key) === norm(key));

  const fieldRefsToUrls = (key: string) => {
    const f = getField(key);
    const nodes = f?.references?.nodes ?? [];
    return nodes.map(refToUrl).filter(Boolean) as string[];
  };

  return {
    title: getField('title')?.value ?? null,
    intro: getField('intro')?.value ?? null,
    hero_links: fieldRefsToUrls('hero_links'),
    hero_rechts: fieldRefsToUrls('hero_rechts'),
    produkt_tile: fieldRefsToUrls('produkt_tile'),
  };
}

async function loadCriticalData({
  context,
}: Pick<LoaderFunctionArgs, 'context'>) {
  const {storefront} = context;

  const {collection} = await storefront.query(COLLECTION_BY_HANDLE_QUERY, {
    variables: {handle: 'main-collection'},
  });

  const rawProducts = (collection?.products?.nodes ?? []) as ProductLike[];

  const seriesHandles = Array.from(
    new Set(
      rawProducts
        .map((product) => {
          const ref = product.metafieldSeries?.reference;
          return ref?.__typename === 'Metaobject'
            ? (ref as MetaobjectRef).handle
            : null;
        })
        .filter(Boolean),
    ),
  ) as string[];

  const seriesMetaEntries = await Promise.all(
    seriesHandles.map(async (handle) => {
      const data = await storefront.query(SERIES_META_BY_HANDLE_QUERY, {
        variables: {handle},
      });

      const series = data?.series;
      const fields = series?.fields ?? [];

      return {
        handle,
        seriesMeta: buildSeriesMetaFromFields(fields),
      };
    }),
  );

  const seriesMetaByHandle = Object.fromEntries(
    seriesMetaEntries.map((entry) => [entry.handle, entry.seriesMeta]),
  );

  const products = rawProducts.map((product) => {
    const ref = product.metafieldSeries?.reference;
    const seriesHandle =
      ref?.__typename === 'Metaobject' ? (ref as MetaobjectRef).handle : null;

    return {
      ...product,
      seriesMeta: seriesHandle
        ? (seriesMetaByHandle[seriesHandle] ?? null)
        : null,
    };
  });

  const groupedProducts = groupProductsBySeries(products);

  return {collection, products: groupedProducts};
}

function loadDeferredData(_args: Pick<LoaderFunctionArgs, 'context'>) {
  return {};
}

function groupProductsBySeries(products: ProductLike[]) {
  const seenSeries = new Set<string>();
  const result: ProductLike[] = [];

  for (const product of products) {
    const seriesRef = product.metafieldSeries?.reference;
    const isMetaobject = seriesRef?.__typename === 'Metaobject';
    const seriesHandle = isMetaobject
      ? (seriesRef as MetaobjectRef).handle
      : null;

    if (seriesHandle) {
      if (seenSeries.has(seriesHandle)) continue;
      seenSeries.add(seriesHandle);
    }

    result.push(product);
  }

  return result;
}

function refToImageLike(node: any) {
  if (!node) return null;

  if (node.__typename === 'MediaImage' && node.image) return node.image;

  if (node.__typename === 'GenericFile' && node.url) {
    return {__genericUrl: node.url};
  }

  return null;
}

function getTileImages(product: ProductLike) {
  const tileImage = product.seriesMeta?.produkt_tile?.[0] ?? null;
  const tileImageHover = product.seriesMeta?.produkt_tile?.[1] ?? null;

  if (tileImage) {
    return {
      main: {__genericUrl: tileImage},
      hover: tileImageHover ? {__genericUrl: tileImageHover} : null,
    };
  }

  const mf = normalizeAllMetafields(product.metafields ?? []).product_tile;
  const main = mf?.list?.[0] ?? product.featuredImage ?? null;
  const hover = mf?.list?.[1] ?? null;

  return {main, hover};
}

function ProductItem({product}: {product: ProductLike}) {
  const {main, hover} = getTileImages(product);
  const [isHover, setIsHover] = useState(false);
  const showHover = Boolean(hover && isHover);

  const seriesRef = product.metafieldSeries?.reference;
  const isMetaobject = seriesRef?.__typename === 'Metaobject';
  const seriesHandle = isMetaobject
    ? (seriesRef as MetaobjectRef).handle
    : null;

  const targetUrl = seriesHandle
    ? `/series/${seriesHandle}`
    : `/products/${product.handle}`;

  const title =
    isMetaobject && (seriesRef as MetaobjectRef).seriesTitle?.value
      ? (seriesRef as MetaobjectRef).seriesTitle?.value
      : product.seriesMeta?.title || product.title;
      
  return (
    <Link to={targetUrl} className="product-item" prefetch="intent">
      <div
        className="product-media"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        style={{position: 'relative', aspectRatio: '778/519'}}
      >
        {main && !(main as any).__genericUrl && (
          <Image
            data={main as any}
            alt={(main as any)?.altText || title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 0 : 1,
              transition: 'opacity .25s ease',
            }}
            sizes="(min-width: 45em) 30rem, 100vw"
          />
        )}

        {main && (main as any).__genericUrl && (
          <img
            src={(main as any).__genericUrl}
            alt={title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 0 : 1,
              transition: 'opacity .25s ease',
            }}
            loading="lazy"
          />
        )}

        {hover && !(hover as any).__genericUrl && (
          <Image
            data={hover as any}
            alt={(hover as any)?.altText || title}
            sizes="(min-width: 60rem) 40rem, 100vw"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 1 : 0,
              transition: 'opacity .25s ease',
            }}
            loading="lazy"
          />
        )}

        {hover && (hover as any).__genericUrl && (
          <img
            src={(hover as any).__genericUrl}
            alt={title}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 1 : 0,
              transition: 'opacity .25s ease',
            }}
            loading="lazy"
          />
        )}
      </div>

      <div className="product-caption">
        <h4 className="product-title">{title}</h4>
      </div>
    </Link>
  );
}

export function MainCollectionGrid({products}: {products: ProductLike[]}) {
  return (
    <div className="collections">
      <div className="collections-grid">
        {products?.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default function CollectionsIndex() {
  const {collection: _collection, products} = useLoaderData<typeof loader>();

  return (
    <div className="collections">
      <div className="collections-grid">
        {products?.map((product: ProductLike) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
query CollectionByHandle_MainCollection(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  collection(handle: $handle) {
    id
    title
    handle
    image {
      id
      url
      altText
      width
      height
    }

    products(first: 50) {
      nodes {
        id
        title
        handle

        featuredImage {
          url
          altText
          width
          height
        }

        metafields(identifiers: [{namespace: "custom", key: "produkt_tile"}]) {
          namespace
          key
          type
          references(first: 2) {
            nodes {
              __typename
              ... on MediaImage {
                image {
                  url
                  altText
                  width
                  height
                }
              }
              ... on GenericFile {
                url
                mimeType
              }
            }
          }
        }

        metafieldSeries: metafield(namespace: "custom", key: "product_series") {
          reference {
            __typename
            ... on Metaobject {
              handle
              type
            }
          }
        }
      }
    }
  }
}
`;

const SERIES_META_BY_HANDLE_QUERY = `#graphql
query SeriesMetaByHandle(
  $handle: String!
  $country: CountryCode
  $language: LanguageCode
) @inContext(country: $country, language: $language) {
  series: metaobject(handle: {type: "series", handle: $handle}) {
    id
    handle
    fields {
      key
      value
      references(first: 50) {
        nodes {
          __typename
          ... on MediaImage {
            image {
              url
              altText
              width
              height
            }
          }
          ... on GenericFile {
            url
            mimeType
          }
        }
      }
    }
  }
}
`;
