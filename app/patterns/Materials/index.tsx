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
        handle: 'materials', // oder dein eigener Handle
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

function ProductItem({product, isReversed}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className={`material-card ${isReversed ? 'material-card--reverse' : ''}`}
      prefetch="intent"
    >
      {product.featuredImage && (
        <Image
          data={product.featuredImage}
          alt={product.featuredImage.altText || product.title}
          className="material-card__image"
          sizes="(min-width: 60rem) 40rem, 100vw"
        />
      )}
      <div className="material-card__content">
        <h3 className="material-card__title">{product.title}</h3>
        <span className="material-card__cta">→ Order your Sample</span>
      </div>
    </Link>
  );
}

export default function Materials() {
  const {collection} = useLoaderData();

  return (
    <>
      {/* feine Trennlinie oben wie im Screen */}
      <div className="vertical-divider" />

      <div className="materials">
        <div className="materials-grid">
          {collection.products?.nodes?.map((product, i) => (
            <ProductItem
              key={product.id}
              product={product}
              isReversed={i % 2 === 1} // jede zweite Karte spiegeln
            />
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

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle(
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
    products(first: 20) {
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
      }
    }
  }
}
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @typedef {import('storefrontapi.generated').CollectionFragment} CollectionFragment */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
