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
 * Kritische Daten: Collection + daraus abgeleitete, gruppierte Produktliste
 */
async function loadCriticalData({context}) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {
        handle: 'main-collection', // dein Collection-Handle
      },
    },
  );

  const products = collection.products?.nodes ?? [];

  // 👉 pro Serie nur 1 Produkt behalten
  const groupedProducts = groupProductsBySeries(products);

  return {collection, products: groupedProducts};
}

/**
 * Nicht-kritische Daten (deferred) – aktuell leer
 */
function loadDeferredData() {
  return {};
}

/**
 * Gruppiert Produkte nach Series-Metafeld:
 * - wenn Produkt eine Series hat → nur erstes Produkt dieser Serie behalten
 * - Produkte ohne Series bleiben unverändert alle drin
 */
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

function ProductItem({product}) {
  const seriesRef = product.metafieldSeries?.reference;
  const isMetaobject = seriesRef?.__typename === 'Metaobject';
  const seriesHandle = isMetaobject ? seriesRef.handle : null;

  // Ziel-URL: wenn Series vorhanden → /series/<handle>, sonst normale PDP
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
      {product.featuredImage && (
        <Image
          data={product.featuredImage}
          alt={product.featuredImage.altText || title}
          sizes="(min-width: 45em) 30rem, 100vw"
        />
      )}
      <h4>{title}</h4>
    </Link>
  );
}

export default function CollectionsIndex() {
  const {collection, products} = useLoaderData();

  return (
    <div className="collections">
      {/* falls du den Collection-Titel anzeigen willst */}
      {/* <h1>{collection.title}</h1> */}

      <div className="collections-grid">
        {products?.map((product) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

/**
 * Collection-Query: Produkte + Series-Metafeld laden
 */
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
