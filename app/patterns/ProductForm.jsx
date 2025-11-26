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

  const BLACKLIST = new Set([
    'series_hero',
    'product_tile',
    'produkt_duo_top_links',
    'produkt_duo_top_rechts',
    'hero_split_links',
    'hero_split_rechts',
    'teaser_duo_bottom_links',
    'teaser_duo_bottom_rechts',
    'hero_split_text',
    'content',
  ]);

  const hasContent = (m) => {
    if (!m) return false;
    const v = m.value;

    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'number') return !Number.isNaN(v);
    if (typeof v === 'boolean') return true;

    return false;
  };

  const activeProduct =
    Array.isArray(seriesProducts) && seriesProducts.length > 0
      ? seriesProducts[seriesActiveIndex] || seriesProducts[0]
      : product;

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

  const allMetafieldsRaw = Array.isArray(activeProduct?.metafields)
    ? activeProduct.metafields
    : [];

  const allMetafields = allMetafieldsRaw.filter(Boolean);

  // Measurements
  const mfMeasurements = allMetafields.filter(
    (m) => m && isMeasurementsMeta(m) && hasContent(m),
  );

  // andere Metafelder
  const mfOthers = allMetafields.filter((m) => {
    if (!m) return false;

    const key = (m.key || '').toLowerCase().trim();

    if (isMeasurementsMeta(m)) return false;
    if (BLACKLIST.has(key)) return false;
    if (!hasContent(m)) return false;

    return true;
  });

  const hasDetails = mfMeasurements.length > 0 || mfOthers.length > 0;

  console.log(
    'allMetafields:',
    allMetafields.map((m) =>
      m
        ? {
            ns: m.namespace,
            key: m.key,
            value: m.value,
          }
        : m,
    ),
  );
  console.log('mfMeasurements:', mfMeasurements.length);
  console.log('mfOthers:', mfOthers.length);
  console.log('hasDetails:', hasDetails);

  ///////////////////////////////////////////

  const navigate = useNavigate();

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

  console.log(
    'allMetafields:',
    allMetafields.map((m) =>
      m
        ? {
            ns: m.namespace,
            key: m.key,
            value: m.value,
          }
        : m,
    ),
  );

  return (
    <div className="product-form">
      {/* oberer Bereich: Configurator + Details */}
      <div className="product-form-scroller">
        <Configurator
          productOptions={productOptions}
          navigate={navigate}
          seriesProducts={seriesProducts}
          seriesActiveIndex={seriesActiveIndex}
          onChangeSeriesProduct={onChangeSeriesProduct}
          product={activeProduct}
        />

        {hasDetails && <div className="details-test">Details</div>}

        {hasDetails && (
          <div className="configurator__meta">
            {mfMeasurements.length > 0 && (
              <ProductMetaAccordion
                metafields={mfMeasurements}
                product={activeProduct}
              />
            )}

            {mfOthers.length > 0 && (
              <ProductMetaAccordion
                metafields={mfOthers}
                product={activeProduct}
              />
            )}
          </div>
        )}
      </div>

      {/* unterer Bereich: CTA – bleibt immer unten */}
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
