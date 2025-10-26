// app/routes/products.$handle.jsx
import {useLoaderData} from 'react-router';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {ProductDetailInformation} from '../patterns/ProductDetailInformation';
import {normalizeAllMetafields} from '~/utils/metafields';

// 👉 das generierte Fragment als Raw-String importieren
// (Hydrogen/Vite: ?raw liefert den Dateiinhalt als String)
import ProductMetafieldsFragment from '~/graphql/product/product-metafields.fragment.graphql?raw';

/**
 * @type {MetaFunction<typeof loader>}
 */
export const meta = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
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

  // Produkt + alle generierten Metafelder (über das importierte Fragment)
  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {
        handle,
        selectedOptions: getSelectedProductOptions(request),
      },
    }),
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // Lokalisierte Handles korrekt umbiegen
  redirectIfHandleIsLocalized(request, {handle, data: product});

  // 👉 Metafelder zu einer komfortablen Struktur normalisieren
  const metafields = normalizeAllMetafields(product.metafields);

  return {
    product,
    metafields,
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
  const {product} = useLoaderData();

  // Optimistisch gewählte Variante & URL-Param Sync
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml} = product; // ggf. später wieder verwenden

  return (
    <div className="product">
      <ProductDetailInformation product={product} />
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
  ${ProductMetafieldsFragment}

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

    # 👇 hier kommen ALLE aus dem Script exportierten Metafelder rein
    ...ProductCustomMetafields
  }

  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
`;

/** @typedef {import('@shopify/remix-oxygen').LoaderFunctionArgs} LoaderFunctionArgs */
/** @template T @typedef {import('react-router').MetaFunction<T>} MetaFunction */
/** @typedef {import('@shopify/remix-oxygen').SerializeFrom<typeof loader>} LoaderReturnData */
