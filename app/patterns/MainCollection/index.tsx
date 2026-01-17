/* eslint-disable @typescript-eslint/no-explicit-any */
import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {LoaderFunctionArgs} from '@shopify/remix-oxygen';

type SeriesField = {key: string; value?: string | null};
type MetaobjectRef = {
  __typename: 'Metaobject';
  handle?: string | null;
  fields?: SeriesField[] | null;
};

type ProductLike = {
  id: string;
  title: string;
  handle: string;
  featuredImage?: unknown | null;
  metafield?: {
    references?: {nodes?: Array<{image?: unknown | null} | null> | null} | null;
  } | null;
  metafieldSeries?: {
    reference?: MetaobjectRef | {__typename?: string} | null;
  } | null;
};

export async function loader(args: LoaderFunctionArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({
  context,
}: Pick<LoaderFunctionArgs, 'context'>) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {handle: 'main-collection'},
    },
  );

  const products = (collection?.products?.nodes ?? []) as ProductLike[];

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

function getTileImages(product: ProductLike) {
  const refs =
    product.metafield?.references?.nodes
      ?.map((n) => n?.image ?? null)
      .filter(Boolean) ?? [];

  return {
    main: refs[0] || product.featuredImage || null,
    hover: refs[1] || null,
  };
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

  let title = product.title;
  if (isMetaobject && Array.isArray((seriesRef as MetaobjectRef).fields)) {
    const titleField = (seriesRef as MetaobjectRef).fields!.find(
      (f) => f.key === 'title',
    );
    if (titleField?.value) title = titleField.value;
  }

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
        {main && (
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
        {hover && (
          <Image
            data={hover as any}
            alt={(hover as any)?.altText || title}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 1 : 0,
              transition: 'opacity .25s ease',
            }}
            sizes="(min-width: 45em) 30rem, 100vw"
          />
        )}
      </div>
      <div className="h4-test">
        <h4>{title}</h4>
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
  query CollectionByHandle__CollectionsRoute(
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

          metafieldSeries: metafield(namespace: "custom", key: "product_series") {
            reference {
              __typename
              ... on Metaobject {
                handle
                type
                fields {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  }
`;
