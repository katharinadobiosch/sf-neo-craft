import {useMemo} from 'react';
import {useAside} from '~/patterns/Aside';
import {useNavigate} from 'react-router';
import {Configurator} from './Configurator';
import {ProductMetaAccordion} from './ProductMetaAccordion';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';

/**
 * @param {{
 *   productOptions: MappedProductOptions[];
 *   selectedVariant: ProductFragment['selectedOrFirstAvailableVariant'];
 * }}
 */
export function ProductForm({
  productOptions,
  product,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {
  const {open: openAside} = useAside();

  const navigate = useNavigate();
  const norm = (s = '') =>
    s
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

  const isMeasurementsMeta = (m) => {
    const n = norm(m?.key || m?.definition?.name || m?.name || '');
    return n === 'measurements' || n === 'measurement' || n.includes('measure');
  };

  const allMetafields = Array.isArray(product?.metafields)
    ? product.metafields
    : [];
  const mfMeasurements = allMetafields.filter(isMeasurementsMeta);
  const mfOthers = allMetafields.filter((m) => !isMeasurementsMeta(m));

  const currentVariant = useMemo(() => {
    for (const opt of productOptions || []) {
      const sel = opt.optionValues?.find((v) => v.selected);
      if (sel?.variant) return sel.variant;
    }
    const first = productOptions?.[0]?.optionValues?.[0];
    return first?.variant || first?.firstSelectableVariant || null;
  }, [productOptions]);

  const money = (num, currency = 'USD') =>
    new Intl.NumberFormat(undefined, {style: 'currency', currency}).format(
      Number(num || 0),
    );

  const allSelected =
    Array.isArray(productOptions) &&
    productOptions.every((opt) => opt?.optionValues?.some((v) => v.selected));

  const isReady = !!currentVariant?.availableForSale && allSelected;
  const price = Number(currentVariant?.price?.amount || 0);
  const currency = currentVariant?.price?.currencyCode || 'USD';

  return (
    <div className="product-form">
      <Configurator
        productOptions={productOptions}
        navigate={navigate}
        seriesProducts={seriesProducts}
        seriesActiveIndex={seriesActiveIndex}
        onChangeSeriesProduct={onChangeSeriesProduct}
        product={product}
      />

      {/* Container 2: Meta (eigener Scroll), default: geschlossen (falls unterstützt) */}
      <div className="configurator__meta">
        {/* 1) Measurements zuerst */}
        {mfMeasurements.length > 0 && (
          <ProductMetaAccordion
            metafields={mfMeasurements}
            product={product}
            // optional: defaultOpen={false}
          />
        )}

        {/* 2) danach der Rest */}
        {mfOthers.length > 0 && (
          <ProductMetaAccordion
            metafields={mfOthers}
            product={product}
            // optional: defaultOpen={false}
          />
        )}
      </div>

      <div className="pdp__cta-container">
        <div className={`cfg-cta ${isReady ? 'is-active' : 'is-idle'}`}>
          <span className="cta-arrow">→</span>
          <span className="cta-price">{money(price, currency)}</span>
          <AddToCartButton
            disabled={!currentVariant || !currentVariant.availableForSale}
            onClick={() => openAside('cart')}
            lines={
              currentVariant
                ? [{merchandiseId: currentVariant.id, quantity: 1}]
                : []
            }
          >
            {currentVariant?.availableForSale ? 'Add to Cart' : 'Sold out'}
          </AddToCartButton>
        </div>
        <div className="pdp__question">
          <div>Further Questions?</div>
        </div>
      </div>
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
