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

const ACCORDION_KEYS = new Set([
  'measurements',
  'material',
  'technical_specs',
  'photometric_specs',
  'electric_specs',
  'certification',
  'lead_time_shipping',
  'download',
  'mirror_glass_type',
  'dichroic_glass',
]);

export function ProductForm({
  productOptions,
  product,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
  onVariantReselect,
}) {
  const {open: openAside} = useAside();
  const navigate = useNavigate();

  const hasContent = (m) => {
    if (!m) return false;

    const v = m?.value;
    if (typeof v === 'string') return v.trim().length > 0;
    if (typeof v === 'number') return !Number.isNaN(v);
    if (typeof v === 'boolean') return true;

    if (m?.reference) return true;
    if (Array.isArray(m?.references?.nodes) && m.references.nodes.length > 0) {
      return true;
    }

    return false;
  };

  const activeProduct =
    Array.isArray(seriesProducts) && seriesProducts.length > 0
      ? seriesProducts[seriesActiveIndex] || seriesProducts[0]
      : product;

  const allMetafieldsRaw = Array.isArray(activeProduct?.metafields)
    ? activeProduct.metafields
    : [];

  const allMetafields = allMetafieldsRaw.filter(Boolean);

  const mfShipping = getMfByKey(allMetafields, 'shipping');

  const mfMeasurements = allMetafields.filter((m) => {
    const key = String(m?.key || '')
      .toLowerCase()
      .trim();
    return key === 'measurements' && hasContent(m);
  });

  const mfOthers = allMetafields.filter((m) => {
    const key = String(m?.key || '')
      .toLowerCase()
      .trim();
    if (key === 'measurements') return false;
    if (!ACCORDION_KEYS.has(key)) return false;
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

  const money = (num, currency = 'EUR') =>
    new Intl.NumberFormat('de-DE', {style: 'currency', currency}).format(
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

  return (
    <div className="product-form pf--segmented">
      <div className="product-form__configurator">
        <Configurator
          productOptions={productOptions}
          navigate={navigate}
          seriesProducts={seriesProducts}
          seriesActiveIndex={seriesActiveIndex}
          onChangeSeriesProduct={onChangeSeriesProduct}
          product={activeProduct}
          onVariantReselect={onVariantReselect}
        />
      </div>

      <div className="product-form__sections">
        <ProductDetailsSection
          mfMeasurements={mfMeasurements}
          mfOthers={mfOthers}
          product={activeProduct}
        />
      </div>

      <div className="product-form__shipping">
        <ProductShippingSection title={shippingTitle} lines={shippingLines} />
      </div>

      <div className="pdp__cta-container">
        <div className="cta-button">
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

        <div
          className="cta-question"
          onClick={() => (window.location = 'mailto:test@example.com')}
        >
          Further Questions?
        </div>
      </div>
    </div>
  );
}
