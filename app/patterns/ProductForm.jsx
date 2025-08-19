import {useNavigate} from 'react-router';
import {Configurator} from './Configurator';
import {ProductMetaAccordion} from './ProductMetaAccordion';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({productOptions, product}) {
  const navigate = useNavigate();

  return (
    <div className="product-form">
      <Configurator productOptions={productOptions} navigate={navigate} />
      <ProductMetaAccordion metafields={product?.metafields} />
    </div>
  );
}

/**
 * @param {{
 *   swatch?: Maybe<ProductOptionValueSwatch> | undefined;
 *   name: string;
 * }}
 */
// function ProductOptionSwatch({swatch, name}) {
//   const image = swatch?.image?.previewImage?.url;
//   const color = swatch?.color;

//   if (!image && !color) return name;

//   return (
//     <div
//       aria-label={name}
//       className="product-option-label-swatch"
//       style={{
//         backgroundColor: color || 'transparent',
//       }}
//     >
//       {!!image && <img src={image} alt={name} />}
//     </div>
//   );
// }

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
