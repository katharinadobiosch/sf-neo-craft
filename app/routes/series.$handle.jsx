// app/routes/series.$handle.jsx
import {useLoaderData} from 'react-router';
import {useState} from 'react';
import {ProductDetailInformation} from '../patterns/ProductDetailInformation';
import {getSelectedProductOptions} from '@shopify/hydrogen';
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

  const norm = (s) =>
    String(s ?? '')
      .trim()
      .toLowerCase();
  const getField = (key) => fields.find((f) => norm(f.key) === norm(key));

  const refToUrl = (node) => {
    if (!node) return null;

    // häufigster Fall
    if (node.__typename === 'MediaImage') return node.image?.url ?? null;
    if (node.__typename === 'GenericFile') return node.url ?? null;

    // fallback: falls Shopify/Query einen anderen Typ liefert, aber eine URL irgendwo drin steckt
    if (typeof node.url === 'string') return node.url;
    if (typeof node?.image?.url === 'string') return node.image.url;
    if (typeof node?.previewImage?.url === 'string')
      return node.previewImage.url;

    return null;
  };

  const fieldRefsToUrls = (key) => {
    const f = getField(key);
    const nodes = f?.references?.nodes ?? [];
    return nodes.map(refToUrl).filter(Boolean);
  };

  const productsField = getField('products');
  const products = productsField?.references?.nodes ?? [];

  if (!products.length) {
    throw new Error('No products connected to this series');
  }

  const seriesMeta = {
    title: getField('title')?.value ?? null,
    intro: getField('intro')?.value ?? null,
    hero_links: fieldRefsToUrls('hero_links'), // [main, hover]
    hero_rechts: fieldRefsToUrls('hero_rechts'), // [main, hover]
  };

  console.log('seriesMeta.hero_links', seriesMeta.hero_links);
  console.log('seriesMeta.hero_rechts', seriesMeta.hero_rechts);

  console.log(
    'raw hero_links nodes',
    (getField('hero_links')?.references?.nodes ?? []).map((n) => ({
      t: n.__typename,
      url: n.url,
      img: n.image?.url,
      preview: n.previewImage?.url,
    })),
  );

  const activeIndex = 0;

  return {
    series,
    products,
    activeIndex,
    seriesMeta,
  };
}

export default function SeriesPage() {
  const {
    series,
    products,
    activeIndex: initialIndex,
    seriesMeta,
  } = useLoaderData();

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const safeProducts = products ?? [];
  const activeProduct = safeProducts[activeIndex] ?? null;

  const titleField = series.fields.find((f) => f.key === 'title');
  const title = titleField?.value ?? 'Series';

  return (
    <div className="product">
      <h1>{title}</h1>

      {activeProduct ? (
        <ProductDetailInformation
          key={activeProduct.id}
          product={activeProduct}
          seriesProducts={safeProducts}
          seriesActiveIndex={activeIndex}
          onChangeSeriesProduct={setActiveIndex}
          seriesMeta={seriesMeta}
        />
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

      reference {
        __typename
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
    $handle: String!
    $selectedOptions: [SelectedOptionInput!]
    $metafieldIdentifiers: [HasMetafieldsIdentifier!]!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    series: metaobject(handle: {type: "series", handle: $handle}) {
      id
      handle
      fields {
        key
        value

        references(first: 50) {
          nodes {
            __typename

            ... on Product {
              ...Product
            }

            ... on MediaImage {
              image { url altText width height }
            }

            ... on GenericFile {
              url
              mimeType
            }
          }
        }
      }
    }
  }
`;
