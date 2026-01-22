import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {HeroSplit_GalleryBand} from '../HeroSplit';
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

  // ===== TOP (Square Variant): Series-Hero ODER Standard-Duo + Description =====
  const topLeft = metafields?.produkt_duo_top_links?.list?.[0]?.url;
  const topLeftHover = metafields?.produkt_duo_top_links?.list?.[1]?.url;

  const topRight = metafields?.produkt_duo_top_rechts?.list?.[0]?.url;
  const topRightHover = metafields?.produkt_duo_top_rechts?.list?.[1]?.url;

  const seriesHero = metafields?.series_hero;
  const seriesImage = seriesHero?.list?.[0]?.url;
  const seriesImageHover = seriesHero?.list?.[1]?.url;
  const hasSeriesHero = Boolean(seriesImage);

  // ===== HERO SPLIT (Band): nimmt 2 Bilder aus Produktbildern =====
  const imageNodes = product.images?.edges?.map((edge) => edge.node) ?? [];
  const mainImage = imageNodes?.[3]?.url ?? imageNodes?.[0]?.url ?? null;

  const thirdImage =
    imageNodes?.[2]?.url ??
    imageNodes?.[1]?.url ??
    imageNodes?.[0]?.url ??
    null;

  // ===== BOTTOM TeaserDuo (aus Metafeldern) =====
  const bottomLeft = metafields?.teaser_duo_bottom_links?.list?.[0]?.url;
  const bottomLeftHover = metafields?.teaser_duo_bottom_links?.list?.[1]?.url;

  const bottomRight = metafields?.teaser_duo_bottom_rechts?.list?.[0]?.url;
  const bottomRightHover = metafields?.teaser_duo_bottom_rechts?.list?.[1]?.url;

  return (
    <div className="pdp">
      {/* TOP: square-variant */}
      <div className="square-variant">
        <TeaserDuo
          left={hasSeriesHero ? seriesImage : topLeft}
          leftHover={hasSeriesHero ? seriesImageHover : topLeftHover}
          right={hasSeriesHero ? null : topRight}
          rightHover={hasSeriesHero ? null : topRightHover}
          isSingle={hasSeriesHero}
          content={product.descriptionHtml}
          
        />
      </div>

      {/* MAIN: Configurator + Gallery */}
      <ProductMain
        product={product}
        selectedVariant={selectedVariant}
        seriesProducts={seriesProducts}
        seriesActiveIndex={seriesActiveIndex}
        onChangeSeriesProduct={onChangeSeriesProduct}
      />

      {/* BELOW MAIN: Band + TeaserDuo */}
      <HeroSplit_GalleryBand leftImg={thirdImage} rightImg={mainImage} />

      <TeaserDuo
        className="pdp__teaser-duo"
        left={bottomLeft}
        leftHover={bottomLeftHover}
        right={bottomRight}
        rightHover={bottomRightHover}
      />
    </div>
  );
}
