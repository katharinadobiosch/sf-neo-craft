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
  // ❌ Diese Keys sollen NICHT im Meta-Bereich angezeigt werden
  const HIDE_KEYS = new Set([
    'hero_split_text', // dein Metafeld-Name aus Shopify
  ]);

  const mfOthers = allMetafields.filter((m) => {
    const key = (m?.key || '').toLowerCase().trim();

    // nicht zeigen, wenn in HIDE_KEYS
    if (HIDE_KEYS.has(key)) return false;

    // nicht zeigen, wenn ein Measurement-Feld
    if (isMeasurementsMeta(m)) return false;

    return true;
  });

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

  console.log('mfmeasurements:', mfMeasurements.length);
  console.log('mfothers:', mfOthers.length);

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
      {(mfMeasurements.length > 0 || mfOthers.length > 0) && (
        <div className="details-test">Details</div>
      )}

      <div className="configurator__meta">
        {mfMeasurements.length > 0 && (
          <ProductMetaAccordion
            metafields={mfMeasurements}
            product={product}
            // optional: defaultOpen={false}
          />
        )}

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

/** @typedef {import('@shopify/hydrogen').MappedProductOptions} MappedProductOptions */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').Maybe} Maybe */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').ProductOptionValueSwatch} ProductOptionValueSwatch */
/** @typedef {import('storefrontapi.generated').ProductFragment} ProductFragment */
