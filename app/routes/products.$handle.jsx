// app/routes/products.$handle.jsx

import {useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductDetailInformation} from '../patterns/ProductDetailInformation';
import {MaterialsProductDetail} from '../patterns/MaterialsProductDetail';

import {normalizeAllMetafields} from '~/utils/metafields';

import metafieldDefs from '~/graphql/product/product-metafield-defs.json';

const METAFIELD_IDENTIFIERS = metafieldDefs
  .filter(
    (d) => d.ownerType === 'PRODUCT' && d?.access?.storefront === 'PUBLIC_READ',
  )
  .map((d) => ({namespace: d.namespace, key: d.key}));

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  const title = data?.product?.title ?? '';
  const handle = data?.product?.handle ?? '';

  return [
    {title: `Hydrogen | ${title}`},
    {
      rel: 'canonical',
      href: handle ? `/products/${handle}` : '/',
    },
  ];
};

/**
 * Loader – holt kritische Daten (Product) + normalisierte Metafelder
 * @param {LoaderFunctionArgs} args
 */
export async function loader(args) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
        metafieldIdentifiers: METAFIELD_IDENTIFIERS,
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // Lokalisierte Handles korrekt umbiegen
  redirectIfHandleIsLocalized(request, {handle, data: product});
  const metafields = normalizeAllMetafields(product.metafields ?? []);

  // statt materialBoolean:
  const isMaterialsPdp =
    product?.collections?.nodes?.some((c) => c.handle === 'materials') ?? false;

  return {
    product,
    metafields,
    isMaterialsPdp,
  };
}

/**
 * Nicht-kritische Daten (deferred) – aktuell leer
 */
function loadDeferredData() {
  return {};
}

export default function Product() {
  /** @type {LoaderReturnData} */
  const {product, isMaterialsPdp} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  return (
    <div className="product">
      {isMaterialsPdp ? (
        <MaterialsProductDetail product={product} />
      ) : (
        <ProductDetailInformation product={product} />
      )}
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

/**
 * EIN gemeinsames GraphQL-Dokument:
 * 1) das importierte, generierte Metafields-Fragment
 * 2) Variant-Fragment
 * 3) Product-Fragment, das das Metafields-Fragment spreadet
 * 4) Query
 *
 * Wichtig: Das importierte Fragment MUSS hier VOR seinem Gebrauch stehen.
 */
const PRODUCT_QUERY = `#graphql
  fragment ProductVariantFragment on ProductVariant {
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

  fragment ProductFragment on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description

    collections(first: 10) { nodes { handle } }

    images(first: 10) { edges { node { id url altText width height } } }

    encodedVariantExistence
    encodedVariantAvailability

    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariantFragment }
        swatch { color image { previewImage { url } } }
      }
    }

    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) { ...ProductVariantFragment }

    adjacentVariants(selectedOptions: $selectedOptions) { ...ProductVariantFragment }

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

  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]
    $metafieldIdentifiers: [HasMetafieldsIdentifier!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...ProductFragment
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
