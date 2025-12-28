// app/graphql/fragments/product.fragments.js
export const PRODUCT_VARIANT_FRAGMENT = `#graphql
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
`;

export const PRODUCT_FRAGMENT = `#graphql
  fragment ProductFragment on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description

    collections(first: 10) {
      nodes { handle }
    }

    images(first: 10) {
      edges { node { id url altText width height } }
    }

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
`;
