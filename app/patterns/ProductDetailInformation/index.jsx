import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {ProductMain} from './ProductMain';
import {normalizeAllMetafields} from '~/utils/metafields';

export function ProductDetailInformation({
  product,
  // optional, nur auf Serien-Seiten gesetzt
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {
  // Variant-State
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // 👉 Metafelder direkt vom Produkt normalisieren
  const metafields = normalizeAllMetafields(product.metafields ?? []);

  // Top-Teaser (oben)
  const topLeft = metafields?.produkt_duo_top_links?.list?.[0]?.url;
  const topLeftHover = metafields?.produkt_duo_top_links?.list?.[1]?.url;

  const topRight = metafields?.produkt_duo_top_rechts?.list?.[0]?.url;
  const topRightHover = metafields?.produkt_duo_top_rechts?.list?.[1]?.url;

  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          left={topLeft}
          leftHover={topLeftHover}
          rightHover={topRightHover}
          right={topRight}
          content={product.description}
        />
      </div>

      <ProductMain
        product={product}
        selectedVariant={selectedVariant}
        seriesProducts={seriesProducts}
        seriesActiveIndex={seriesActiveIndex}
        onChangeSeriesProduct={onChangeSeriesProduct}
      />
    </div>
  );
}
