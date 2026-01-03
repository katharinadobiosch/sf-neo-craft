import {useMemo} from 'react';
import {useAside} from '~/patterns/Aside';
import {useNavigate} from 'react-router';
import {Configurator} from '../Configurator';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';
import {ProductDetailsSection} from './ProductDetailsSection';
import {ProductShippingSection} from './ProductShippingSection';

function getMfByKey(metafields, key) {
  const k = String(key).toLowerCase().trim();
  return (metafields || []).find(
    (m) =>
      String(m?.key || '')
        .toLowerCase()
        .trim() === k,
  );
}

export function ProductForm({
  productOptions,
  product,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {
  const {open: openAside} = useAside();
  const navigate = useNavigate();

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
    'product_series',
    'content',
    'shipping', // ensure shipping metafield does not land in "mfOthers"
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

  const mfShipping = getMfByKey(allMetafields, 'shipping');

  const mfMeasurements = allMetafields.filter(
    (m) => m && isMeasurementsMeta(m) && hasContent(m),
  );

  const mfOthers = allMetafields.filter((m) => {
    if (!m) return false;
    const key = (m.key || '').toLowerCase().trim();
    if (isMeasurementsMeta(m)) return false;
    if (BLACKLIST.has(key)) return false;
    if (!hasContent(m)) return false;
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

  const hasOptionsArray = Array.isArray(productOptions);
  const allSelected =
    hasOptionsArray &&
    (productOptions.length === 0 ||
      productOptions.every((opt) =>
        opt?.optionValues?.some((v) => v.selected),
      ));

  const isReady = !!currentVariant?.availableForSale && allSelected;
  const price = Number(currentVariant?.price?.amount || 0);
  const currency = currentVariant?.price?.currencyCode || 'USD';

  const shippingTitle =
    mfShipping?.name || mfShipping?.key || 'Lead time + shipping';
  const shippingRaw =
    typeof mfShipping?.value === 'string' && mfShipping.value.trim().length > 0
      ? mfShipping.value
      : null;
  const shippingLines = shippingRaw?.split(/\r?\n/).filter(Boolean) || [
    '2–4 weeks (depending on stock)',
    'parcel-delivery (door to door)',
    'depending on shipping rates:',
    'higher quantities via pallet-delivery (curbside)',
  ];

  // --------- DETAILS: measure height like Configurator ----------

  return (
    <div className="product-form product-form--segmented">
      {/* 1) Configurator – fixed */}
      <div className="product-form__configurator">
        <Configurator
          productOptions={productOptions}
          navigate={navigate}
          seriesProducts={seriesProducts}
          seriesActiveIndex={seriesActiveIndex}
          onChangeSeriesProduct={onChangeSeriesProduct}
          product={activeProduct}
        />
      </div>

      {/* 2) Middle section: Details fill the remaining space */}
      <div className="product-form__sections">
        <ProductDetailsSection
          mfMeasurements={mfMeasurements}
          mfOthers={mfOthers}
          product={activeProduct}
        />
      </div>

      {/* 3) Shipping (keep your classes, just animate panel like cfg-panel) */}
      {/* <ProductShippingSection title={shippingTitle} lines={shippingLines} /> */}

      {/* 4) CTA */}
      <div className="pdp__cta-container">
        <div className={`pf-cta ${isReady ? 'is-active' : 'is-idle'}`}>
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
