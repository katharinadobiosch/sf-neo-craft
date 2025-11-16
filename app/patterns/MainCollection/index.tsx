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
async function loadCriticalData({context, request}) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {
        handle: 'main-collection', // oder dein eigener Handle
      },
    },
  );

  return {collection};
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

  return (
    <Link
      to={`/products/${product.handle}`}
      className="product-item"
      prefetch="intent"
    >
      <div
        className="product-media"
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        onFocus={() => setIsHover(true)}
        onBlur={() => setIsHover(false)}
        // 1) Fläche reservieren & Positionierungs-Kontext
        style={{position: 'relative', aspectRatio: '778/519'}}
      >
        {main && (
          <Image
            data={main}
            alt={main.altText || product.title}
            // 2) absolut & vollflächig
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: showHover ? 0 : 1, // 3) Sichtbarkeit
              transition: 'opacity .25s ease',
            }}
            sizes="(min-width: 45em) 30rem, 100vw"
          />
        )}
        {hover && (
          <Image
            data={hover}
            alt={hover.altText || product.title}
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
      <h4>{product.title}</h4>
    </Link>
  );
}

export default function Collections() {
  const {collection} = useLoaderData();

  return (
    <>
      <div className="collections">
        <div className="collections-grid">
          {collection.products?.nodes?.map((product, index) => (
            <ProductItem key={product.id} product={product} />
          ))}
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
  query CollectionByHandle_MainCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
      image { id url altText width height }
      products(first: 20) {
        nodes {
          id
          title
          handle
          featuredImage { url altText width height }
          metafield(namespace: "custom", key: "product_tile") {
            type
            references(first: 2) {
              nodes {
                ... on MediaImage {
                  image { url altText width height }
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
