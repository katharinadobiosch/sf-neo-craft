import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {ProductDetailInformation} from '../patterns/ProductDetailInformation';
import {getSelectedProductOptions} from '@shopify/hydrogen';
import {normalizeAllMetafields} from '~/utils/metafields';
import metafieldDefs from '~/graphql/product/product-metafield-defs.json';

const METAFIELD_IDENTIFIERS = metafieldDefs
  .filter(
    (d) => d.ownerType === 'PRODUCT' && d?.access?.storefront === 'PUBLIC_READ',
  )
  .map((d) => ({namespace: d.namespace, key: d.key}));

/**
 * Loader – holt das Series-Metaobjekt + referenzierte Produkte
 */
export async function loader({params, context, request}) {
  const {storefront} = context;
  const {handle} = params;

  if (!handle) {
    throw new Error('Expected series handle to be defined');
  }

  // Varianten-Auswahl aus der URL lesen (wie auf der PDP)
  const selectedOptions = getSelectedProductOptions(request);

  const data = await storefront.query(SERIES_QUERY, {
    variables: {
      handle,
      selectedOptions,
      metafieldIdentifiers: METAFIELD_IDENTIFIERS,
    },
  });

  const series = data?.series;
  if (!series) {
    throw new Response('Series not found', {status: 404});
  }

  const fields = series.fields ?? [];
  const productsField = fields.find((f) => f.key === 'products');
  const products = productsField?.references?.nodes ?? [];

  if (!products.length) {
    throw new Error('No products connected to this series');
  }

  // erstmal: erstes Produkt als aktives
  const activeIndex = 0;
  const activeProduct = products[activeIndex];

  // Metafelder des aktiven Produkts normalisieren (für Komponenten, die sie nutzen)
  const metafields = normalizeAllMetafields(activeProduct.metafields || []);

  return {
    series,
    products,
    activeIndex,
    metafields,
  };
}

// export default function SeriesPage() {
//   const {series, products} = useLoaderData();

//   // Fallback, falls noch keine Produkte verknüpft sind
//   const safeProducts = products ?? [];

//   // Titel aus Metaobject-Feld "title"
//   const titleField = series.fields.find((f) => f.key === 'title');
//   const title = titleField?.value ?? 'Series';

//   // aktuell ausgewähltes Produkt (0 = erstes)
//   const [activeIndex, setActiveIndex] = useState(0);
//   const activeProduct = safeProducts[activeIndex] ?? null;

//   return (
//     <div style={{padding: '2rem'}}>
//       <h1>{title}</h1>

//       {/* Produkt-Switcher */}
//       {safeProducts.length > 0 && (
//         <div style={{display: 'flex', gap: '0.75rem', margin: '1.5rem 0'}}>
//           {safeProducts.map((product, index) => {
//             // "OSOM OBLONG" → "OBLONG"
//             const label = product.title.replace(/^OSOM\s+/i, '');
//             const isActive = index === activeIndex;

//             return (
//               <button
//                 key={product.id}
//                 type="button"
//                 onClick={() => setActiveIndex(index)}
//                 style={{
//                   padding: '0.5rem 1rem',
//                   borderRadius: 999,
//                   border: isActive ? '1px solid black' : '1px solid #ccc',
//                   background: isActive ? '#000' : '#fff',
//                   color: isActive ? '#fff' : '#000',
//                   cursor: 'pointer',
//                   fontSize: '0.9rem',
//                   letterSpacing: '0.04em',
//                   textTransform: 'uppercase',
//                 }}
//               >
//                 {label}
//               </button>
//             );
//           })}
//         </div>
//       )}

//       {/* Aktives Produkt + Varianten */}
//       {activeProduct ? (
//         <div style={{marginTop: '2rem'}}>
//           <h2>{activeProduct.title}</h2>
//           <p>Handle: {activeProduct.handle}</p>

//           <h3 style={{marginTop: '1rem'}}>Varianten</h3>
//           <ul>
//             {activeProduct.variants.nodes.map((variant) => (
//               <li key={variant.id}>
//                 {variant.title} – {variant.price.amount}{' '}
//                 {variant.price.currencyCode}
//               </li>
//             ))}
//           </ul>
//         </div>
//       ) : (
//         <p>Keine Produkte in dieser Serie gefunden.</p>
//       )}

//       {/* Debug: JSON kannst du dir bei Bedarf wieder einblenden */}
//       {/* <pre>{JSON.stringify(products, null, 2)}</pre> */}
//     </div>
//   );
// }

export default function SeriesPage() {
  const {series, products, activeIndex: initialIndex} = useLoaderData();

  const safeProducts = products ?? [];

  const titleField = series.fields.find((f) => f.key === 'title');
  const title = titleField?.value ?? 'Series';

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const activeProduct = safeProducts[activeIndex] ?? null;

  return (
    <div className="product">
      <h1>{title}</h1>

      {/* Produkt-Switcher */}
      {safeProducts.length > 0 && (
        <div style={{display: 'flex', gap: '0.75rem', margin: '1.5rem 0'}}>
          {safeProducts.map((product, index) => {
            const label = product.title.replace(/^OSOM\s+/i, '');
            const isActive = index === activeIndex;

            return (
              <button
                key={product.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: 999,
                  border: isActive ? '1px solid black' : '1px solid #ccc',
                  background: isActive ? '#000' : '#fff',
                  color: isActive ? '#fff' : '#000',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      )}

      {/* Hier kommt deine komplette PDP für das aktive Produkt */}
      {activeProduct ? (
        <ProductDetailInformation product={activeProduct} />
      ) : (
        <p>Keine Produkte in dieser Serie gefunden.</p>
      )}
    </div>
  );
}

// GraphQL Query
const SERIES_QUERY = `#graphql
  query SeriesPage($handle: String!) {
    series: metaobject(
      handle: {type: "series", handle: $handle}
    ) {
      id
      handle
      fields {
        key
        value
        references(first: 10) {
          nodes {
            ... on Product {
              id
              title
              handle
              variants(first: 50) {
                nodes {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
