import {useState} from 'react';
import {useLoaderData, Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {LoaderFunctionArgs}
 */
async function loadCriticalData({context}) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {
        handle: 'main-collection', // oder dein eigener Handle
      },
    },
  );
  const products = collection.products?.nodes ?? [];

  // 👉 pro Serie nur 1 Produkt behalten
  const groupedProducts = groupProductsBySeries(products);

  return {collection, products: groupedProducts};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {LoaderFunctionArgs}
 */
function loadDeferredData({context}) {
  return {};
}

function groupProductsBySeries(products) {
  const seenSeries = new Set();
  const result = [];

  for (const product of products) {
    const seriesRef = product.metafieldSeries?.reference;
    const isMetaobject = seriesRef?.__typename === 'Metaobject';
    const seriesHandle = isMetaobject ? seriesRef.handle : null;

    if (seriesHandle) {
      // Serie schon gesehen → Produkt überspringen
      if (seenSeries.has(seriesHandle)) {
        continue;
      }
      seenSeries.add(seriesHandle);
    }

    // erstes Produkt dieser Serie ODER Produkt ohne Serie
    result.push(product);
  }

  return result;
}

function getTileImages(product: any) {
  const refs =
    product.metafield?.references?.nodes
      ?.map((n: any) => n?.image)
      .filter(Boolean) ?? [];
  return {
    main: refs[0] || product.featuredImage || null,
    hover: refs[1] || null,
  };
}

function ProductItem({product}) {
  const {main, hover} = getTileImages(product);
  const [isHover, setIsHover] = useState(false);
  const showHover = Boolean(hover && isHover);

  const seriesRef = product.metafieldSeries?.reference;
  const isMetaobject = seriesRef?.__typename === 'Metaobject';
  const seriesHandle = isMetaobject ? seriesRef.handle : null;

  const targetUrl = seriesHandle
    ? `/series/${seriesHandle}`
    : `/products/${product.handle}`;

  // Titel: wenn Series-Metaobject einen title hat, diesen verwenden
  let title = product.title;
  if (isMetaobject && Array.isArray(seriesRef.fields)) {
    const titleField = seriesRef.fields.find((f) => f.key === 'title');
    if (titleField?.value) {
      title = titleField.value;
    }
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
            data={main}
            alt={main.altText || title}
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
            data={hover}
            alt={hover.altText || title}
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
      <h4>{title}</h4>
    </Link>
  );
}

export default function CollectionsIndex() {
  const {collection, products} = useLoaderData();

  return (
    <>
      <div className="collections">
        <div className="collections-grid">
          {products?.map((product) => {
            return <ProductItem key={product.id} product={product} />;
          })}
        </div>
      </div>
    </>
  );
}

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
// app/patterns/MainCollection/index.tsx
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

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
