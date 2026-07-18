import {useMemo, useState} from 'react';
import {useAside} from '~/patterns/Aside';
import {useNavigate} from 'react-router';
import {Configurator} from '../Configurator';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';
import {ProductDetailsSection} from './ProductDetailsSection';
import {ProductShippingSection} from './ProductShippingSection';

function getMfByKey(metafields, key) {
  const normalizedKey = String(key).toLowerCase().trim();

  return (metafields || []).find(
    (metafield) =>
      String(metafield?.key || '')
        .toLowerCase()
        .trim() === normalizedKey,
  );
}

const ACCORDION_KEYS = new Set([
  'measurements',
  'material',
  'technical_specs',
  'photometric_specs',
  'electric_specs',
  'certification',
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
  const [openSection, setOpenSection] = useState(null);

  const hasContent = (metafield) => {
    if (!metafield) return false;

    const value = metafield.value;

    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return !Number.isNaN(value);
    if (typeof value === 'boolean') return true;

    if (metafield.reference) return true;

    if (
      Array.isArray(metafield.references?.nodes) &&
      metafield.references.nodes.length > 0
    ) {
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

  const mfShipping =
    getMfByKey(allMetafields, 'lead_time_shipping') ||
    getMfByKey(allMetafields, 'shipping');

  const mfMeasurements = allMetafields.filter((metafield) => {
    const key = String(metafield?.key || '')
      .toLowerCase()
      .trim();

    return key === 'measurements' && hasContent(metafield);
  });

  const mfOthers = allMetafields.filter((metafield) => {
    const key = String(metafield?.key || '')
      .toLowerCase()
      .trim();

    if (key === 'measurements') return false;
    if (!ACCORDION_KEYS.has(key)) return false;
    if (!hasContent(metafield)) return false;

    return true;
  });

  const currentVariant = useMemo(() => {
    for (const option of productOptions || []) {
      const selectedValue = option.optionValues?.find(
        (value) => value.selected,
      );

      if (selectedValue?.variant) return selectedValue.variant;
    }

    const firstValue = productOptions?.[0]?.optionValues?.[0];

    return firstValue?.variant || firstValue?.firstSelectableVariant || null;
  }, [productOptions]);

  const money = (amount, currency = 'EUR') =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency,
    }).format(Number(amount || 0));

  const price = Number(currentVariant?.price?.amount || 0);
  const currency = currentVariant?.price?.currencyCode || 'EUR';

  const shippingTitle = mfShipping?.name || 'Lead Time / Shipping';

  const shippingRaw =
    typeof mfShipping?.value === 'string' && mfShipping.value.trim().length > 0
      ? mfShipping.value
      : null;

  const shippingLines = shippingRaw
    ? shippingRaw.split(/\r?\n/).filter(Boolean)
    : [];

  return (
    <div className="product-form pf--segmented">
      <div className="product-form__configurator">
        <Configurator
          productTitle={activeProduct?.title}
          productOptions={productOptions}
          navigate={navigate}
          seriesProducts={seriesProducts}
          seriesActiveIndex={seriesActiveIndex}
          onChangeSeriesProduct={onChangeSeriesProduct}
          product={activeProduct}
          onVariantReselect={onVariantReselect}
        />
      </div>

      <div className="product-form__details-scroller">
        <div className="product-form__sections">
          <ProductDetailsSection
            mfMeasurements={mfMeasurements}
            mfOthers={mfOthers}
            product={activeProduct}
            openKey={openSection}
            onToggle={setOpenSection}
          />
        </div>

        {shippingRaw ? (
          <div className="product-form__shipping">
            <ProductShippingSection
              title={shippingTitle}
              lines={shippingLines}
              open={openSection === 'shipping'}
              onToggle={() =>
                setOpenSection((current) =>
                  current === 'shipping' ? null : 'shipping',
                )
              }
            />
          </div>
        ) : null}
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
                ? [
                    {
                      merchandiseId: currentVariant.id,
                      quantity: 1,
                    },
                  ]
                : []
            }
          >
            {currentVariant?.availableForSale ? 'Add to Cart' : 'Sold out'}
          </AddToCartButton>
        </div>

        <button
          type="button"
          className="cta-question"
          onClick={() => {
            window.location.href = 'mailto:test@example.com';
          }}
        >
          Contact our Team
        </button>
      </div>
    </div>
  );
}
