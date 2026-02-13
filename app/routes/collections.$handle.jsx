// app/routes/collections.$handle.jsx
import {useLoaderData} from 'react-router';
import {MainCollectionGrid} from '~/patterns/MainCollection';

function groupProductsBySeries(products) {
  const seenSeries = new Set();
  const result = [];

  for (const product of products) {
    const seriesRef = product?.metafieldSeries?.reference;
    const isMetaobject = seriesRef?.__typename === 'Metaobject';
    const seriesHandle = isMetaobject ? seriesRef?.handle : null;

    if (seriesHandle) {
      if (seenSeries.has(seriesHandle)) continue;
      seenSeries.add(seriesHandle);
    }

    result.push(product);
  }

  return result;
}

export async function loader({context, params}) {
  const handle = params?.handle;
  if (!handle) throw new Response(null, {status: 404});

  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {handle},
    },
  );

  if (!collection) throw new Response(null, {status: 404});

  const productsRaw = collection?.products?.nodes ?? [];

  // ✅ exakt wie Home: nach Series dedupen
  const products = groupProductsBySeries(productsRaw);

  return {collection, products};
}

export default function CollectionHandle() {
  const {products} = useLoaderData();
  return (
    <div className="collection">
      <MainCollectionGrid products={products} />
    </div>
  );
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle__AnyCollection(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      title
      handle
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

          metafields(identifiers: [{namespace: "custom", key: "product_tile"}]) {
            namespace
            key
            type
            value
            reference {
              __typename
              ... on MediaImage {
                image { url altText width height }
              }
            }
            references(first: 2) {
              nodes {
                __typename
                ... on MediaImage {
                  image { url altText width height }
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
