import {useLoaderData, Link} from 'react-router';
import {getPaginationVariables, Image} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/patterns/PaginatedResourceSection';

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
  // const paginationVariables = getPaginationVariables(request, {
  //   pageBy: 20,
  // });

  // const [{collections}] = await Promise.all([
  //   context.storefront.query(COLLECTIONS_QUERY, {
  //     variables: paginationVariables,
  //   }),
  //   // Add other queries here, so that they are loaded in parallel
  // ]);

  // return {collections};
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

function ProductItem({product}) {
  return (
    <Link
      to={`/products/${product.handle}`}
      className="product-item"
      prefetch="intent"
    >
      {product.featuredImage && (
        <Image
          data={product.featuredImage}
          alt={product.featuredImage.altText || product.title}
          aspectRatio="1/1"
          sizes="(min-width: 45em) 30rem, 100vw"
        />
      )}
      <h4>{product.title}</h4>
    </Link>
  );
}

export default function Collections() {
  const {collection} = useLoaderData();

  return (
    <div className="collections">
      {/* <h2>{collection.title}</h2> */}

      <div className="collections-grid">
        {collection.products?.nodes?.map((product, index) => (
          <ProductItem key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

// export default function Collections() {
//   /** @type {LoaderReturnData} */
//   const {collection} = useLoaderData();
//   console.log('collections', collection);

//   return (
//     <div className="collections">
//       <div className="collections-grid">
//         <CollectionItem collection={collection} index={0} />
//       </div>

//       {/* <h1>Collections</h1>
//       <PaginatedResourceSection
//         connection={collection}
//         resourcesClassName="collections-grid"
//       >
//         {
//           ({node: collection, index}) => (
//             <CollectionItem
//               key={collection.id}
//               collection={collection}
//               index={index}
//             />
//           )
//           // )
//         }
//       </PaginatedResourceSection> */}
//     </div>
//   );
// }

/**
 * @param {{
 *   collection: CollectionFragment;
 *   index: number;
 * }}
 */
// function CollectionItem({collection, index}) {
//   return (
//     <Link
//       className="collection-item"
//       key={collection.id}
//       to={`/collections/${collection.handle}`}
//       prefetch="intent"
//     >
//       {collection?.image && (
//         <Image
//           alt={collection.image.altText || collection.title}
//           aspectRatio="1/1"
//           data={collection.image}
//           loading={index < 3 ? 'eager' : undefined}
//           sizes="(min-width: 45em) 400px, 100vw"
//         />
//       )}
//       <h5>{collection.title}</h5>
//     </Link>
//   );
// }

// const COLLECTIONS_QUERY = `#graphql
//   fragment Collection on Collection {
//     id
//     title
//     handle
//     image {
//       id
//       url
//       altText
//       width
//       height
//     }
//   }
//   query StoreCollections(
//     $country: CountryCode
//     $endCursor: String
//     $first: Int
//     $language: LanguageCode
//     $last: Int
//     $startCursor: String
//   ) @inContext(country: $country, language: $language) {
//     collections(
//       first: $first,
//       last: $last,
//       before: $startCursor,
//       after: $endCursor
//     ) {
//       nodes {
//         ...Collection
//       }
//       pageInfo {
//         hasNextPage
//         hasPreviousPage
//         startCursor
//         endCursor
//       }
//     }
//   }
// `;

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
