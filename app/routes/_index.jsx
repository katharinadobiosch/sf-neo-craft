// app/routes/_index.jsx
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

export async function loader({context}) {
  const {collection} = await context.storefront.query(
    COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {handle: 'main-collection'},
    },
  );

  const productsRaw = collection?.products?.nodes ?? [];
  const products = groupProductsBySeries(productsRaw);

  return {products};
}

export default function Homepage() {
  const {products} = useLoaderData();
  return (
    <div className="home">
      <MainCollectionGrid products={products} />
    </div>
  );
}

const COLLECTION_BY_HANDLE_QUERY = `#graphql
  query CollectionByHandle__Home(
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
          metafield: metafield(namespace: "custom", key: "tile_images") {
            references(first: 10) {
              nodes {
                ... on MediaImage {
                  image {
                    url
                    altText
                    width
                    height
                  }
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
