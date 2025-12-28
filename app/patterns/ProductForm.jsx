import {useMemo, useState} from 'react';
import {useAside} from '~/patterns/Aside';
import {useNavigate} from 'react-router';
import {Configurator} from './Configurator';
import {ProductMetaAccordion} from './ProductMetaAccordion';
import {AddToCartButton} from '~/patterns/Cart/AddToCartButton';

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

  const [detailsOpen, setDetailsOpen] = useState(false); // default geschlossen
  const [shippingOpen, setShippingOpen] = useState(false); // default geschlossen

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
    'shipping', // wichtig: damit es nicht zusätzlich in "mfOthers" landet
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

  // Shipping content (rich_text_field -> kommt bei Shopify i.d.R. als HTML-String)
  const mfShipping = getMfByKey(allMetafields, 'shipping');
  const hasShipping = hasContent(mfShipping);

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

  const hasDetails = mfMeasurements.length > 0 || mfOthers.length > 0;

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
    !Array.isArray(productOptions) ||
    productOptions.length === 0 ||
    productOptions.every((opt) => opt?.optionValues?.some((v) => v.selected));

  const isReady = !!currentVariant?.availableForSale && allSelected;
  const price = Number(currentVariant?.price?.amount || 0);
  const currency = currentVariant?.price?.currencyCode || 'USD';

  return (
    <div className="product-form product-form--segmented">
      {/* 1) Configurator – fix */}
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

      {/* 2) Mittlerer Bereich: Details füllt den Platz */}
      <div className="product-form__middle">
        {hasDetails && (
          <section
            className={`pf-section pf-section--details ${detailsOpen ? 'is-open' : ''}`}
          >
            <div className="cfg-head">
              <button
                type="button"
                className="cfg-toggle"
                aria-controls="cfg-variants"
                onClick={() => setDetailsOpen((v) => !v)}
              >
                <span className="cfg-title">Details</span>
                <span className="cfg-plus" aria-hidden />
              </button>
            </div>

            {detailsOpen && (
              <div className="pf-section__body pf-section__body--flex nice-scrollbar">
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
              </div>
            )}
          </section>
        )}
      </div>

      {/* 3) Shipping – fix über CTA */}
      <div className="product-form__shipping">
        <section className={`pf-section ${shippingOpen ? 'is-open' : ''}`}>
          {/* <button
            type="button"
            className="pf-section__head"
            onClick={() => setShippingOpen((v) => !v)}
          >
            <span>Lead time + shipping</span>
            <span className="pf-section__icon">
              {shippingOpen ? (
                <span className="cfg-minus" aria-hidden />
              ) : (
                <span className="cfg-plus" aria-hidden />
              )}
            </span>{' '}
          </button> */}
          <button
            type="button"
            className="cfg-toggle"
            aria-controls="cfg-"
            onClick={() => setShippingOpen((v) => !v)}
          >
            <span className="cfg-title">Lead time + shipping</span>
            <span className="cfg-plus" aria-hidden />
          </button>

          {/* {shippingOpen && (
            <div className="pf-section__body pf-section__body--shipping nice-scrollbar">
              <p>2–4 weeks (depending on stock)</p>
              <p>parcel-delivery (door to door)</p>
              <p>depending on shipping rates:</p>
              <p>higher quantities via pallet-delivery (curbside)</p>
            </div>
          )} */}
          {shippingOpen && (
            <div className="pf-section__body pf-section__body--flex nice-scrollbar">
              <div className="configurator__meta">
                <p>2–4 weeks (depending on stock)</p>
                <p>parcel-delivery (door to door)</p>
                <p>depending on shipping rates:</p>
                <p>higher quantities via pallet-delivery (curbside)</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 4) CTA */}
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
