import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {ProductMain} from './ProductMain';
import {normalizeAllMetafields} from '~/utils/metafields';

export function ProductDetailInformation({
  product,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const metafields = normalizeAllMetafields(product.metafields ?? []);

  // Standard-Duo-Teaser
  const topLeft = metafields?.produkt_duo_top_links?.list?.[0]?.url;
  const topLeftHover = metafields?.produkt_duo_top_links?.list?.[1]?.url;

  const topRight = metafields?.produkt_duo_top_rechts?.list?.[0]?.url;
  const topRightHover = metafields?.produkt_duo_top_rechts?.list?.[1]?.url;

  // Series-Hero (optional)
  const seriesHero = metafields?.series_hero;
  const seriesImage = seriesHero?.list?.[0]?.url;
  const seriesImageHover = seriesHero?.list?.[1]?.url;
  const hasSeriesHero = Boolean(seriesImage); // nur wenn wirklich gepflegt

  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          // wenn series_hero da ist → nur ein Bild (links)
          left={hasSeriesHero ? seriesImage : topLeft}
          leftHover={hasSeriesHero ? seriesImageHover : topLeftHover}
          right={hasSeriesHero ? null : topRight}
          rightHover={hasSeriesHero ? null : topRightHover}
          isSingle={hasSeriesHero}
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
