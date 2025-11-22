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
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }

  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description

    images(first: 10) {
      edges { node { id url altText width height } }
    }

    encodedVariantExistence
    encodedVariantAvailability

    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch { color image { previewImage { url } } }
      }
    }

    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) { ...ProductVariant }

    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariant }

    seo { description title }

    metafields(identifiers: $metafieldIdentifiers) {
      namespace
      key
      type
      value

      reference { __typename
        ... on Metaobject { id type handle fields { key type value } }
        ... on MediaImage { image { url altText width height } }
        ... on Video { sources { url mimeType } }
        ... on Model3d { sources { url mimeType } }
        ... on GenericFile { url mimeType }
      }

      references(first: 50) {
        nodes {
          __typename
          ... on Metaobject { id type handle fields { key type value } }
          ... on MediaImage { image { url altText width height } }
          ... on Video { sources { url mimeType } }
          ... on Model3d { sources { url mimeType } }
          ... on GenericFile { url mimeType }
        }
      }
    }
  }

  query SeriesPage(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]
    $metafieldIdentifiers: [HasMetafieldsIdentifier!]!
  ) @inContext(country: $country, language: $language) {
    series: metaobject(
      handle: {type: "Series", handle: $handle}
    ) {
      id
      handle
      fields {
        key
        value
        references(first: 10) {
          nodes {
            __typename
            ... on Product {
              ...Product
            }
          }
        }
      }
    }
  }
`;
