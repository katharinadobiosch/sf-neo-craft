import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {HeroSplit_GalleryBand} from '../HeroSplit';
import {ProductMain} from './ProductMain';
import {normalizeAllMetafields} from '~/utils/metafields';

function richTextJsonToPlainText(value) {
  if (!value) return '';
  try {
    const json = typeof value === 'string' ? JSON.parse(value) : value;

    const walk = (node) => {
      if (!node) return '';
      if (Array.isArray(node)) return node.map(walk).join('');
      if (node.type === 'text') return node.value ?? '';
      if (node.children) return walk(node.children);
      return '';
    };

    return walk(json).trim();
  } catch {
    // falls es doch schon plain text ist
    return String(value);
  }
}

export function ProductDetailInformation({
  product,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
  seriesConfigurator,
  seriesMeta,
}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const metafields = normalizeAllMetafields(product.metafields ?? []);
  const seriesTopLeft = seriesMeta?.duo_top_left_images?.[0] ?? null;
  const seriesTopLeftHover = seriesMeta?.duo_top_left_images?.[1] ?? null;

  const seriesTopRight = seriesMeta?.duo_top_right_images?.[0] ?? null;
  const seriesTopRightHover = seriesMeta?.duo_top_right_images?.[1] ?? null;

  const hasSeriesTopOverride = Boolean(
    seriesMeta && (seriesTopLeft || seriesTopRight),
  );

  const seriesDescriptionText = richTextJsonToPlainText(
    seriesMeta?.description,
  );

  // ===== TOP (Square Variant): Series-Hero ODER Standard-Duo + Description =====
  // TODO: Remove fallback keys after Shopify exposes renamed metafields in Storefront API.
  const duoTopLeft =
    metafields?.duo_top_left_images ?? metafields?.produkt_duo_top_links;
  const duoTopRight =
    metafields?.duo_top_right_images ?? metafields?.produkt_duo_top_rechts;

  const topLeft = duoTopLeft?.list?.[0]?.url;
  const topLeftHover = duoTopLeft?.list?.[1]?.url;

  const topRight = duoTopRight?.list?.[0]?.url;
  const topRightHover = duoTopRight?.list?.[1]?.url;

  // ===== HERO SPLIT (Band): aus Metafeldern (jeweils [0]=main, [1]=hover) =====
  const heroLeft = metafields?.hero_left_images ?? metafields?.hero_split_links;
  const heroRight =
    metafields?.hero_right_images ?? metafields?.hero_split_rechts;

  const heroSplitLeftImage =
    seriesMeta?.hero_left_images?.[0] ?? heroLeft?.list?.[0]?.url ?? null;
  const heroSplitLeftHover =
    seriesMeta?.hero_left_images?.[1] ?? heroLeft?.list?.[1]?.url ?? null;

  const heroSplitRightImage =
    seriesMeta?.hero_right_images?.[0] ?? heroRight?.list?.[0]?.url ?? null;
  const heroSplitRightHover =
    seriesMeta?.hero_right_images?.[1] ?? heroRight?.list?.[1]?.url ?? null;

  const heroSplitText =
    seriesMeta?.hero_text ??
    metafields?.hero_split_text?.value ??
    metafields?.hero_text?.value ??
    '';

  // ===== BOTTOM TeaserDuo =====
  const singleBottomLeft =
    metafields?.teaser_duo_bottom_links ??
    metafields?.teaser_bottom_left_images;

  const singleBottomRight =
    metafields?.teaser_duo_bottom_rechts ??
    metafields?.teaser_bottom_right_images;

  const bottomLeft =
    seriesMeta?.teaser_bottom_left_images?.[0] ??
    singleBottomLeft?.list?.[0]?.url ??
    null;

  const bottomLeftHover =
    seriesMeta?.teaser_bottom_left_images?.[1] ??
    singleBottomLeft?.list?.[1]?.url ??
    null;

  const bottomRight =
    seriesMeta?.teaser_bottom_right_images?.[0] ??
    singleBottomRight?.list?.[0]?.url ??
    null;

  const bottomRightHover =
    seriesMeta?.teaser_bottom_right_images?.[1] ??
    singleBottomRight?.list?.[1]?.url ??
    null;

  return (
    <div className="pdp">
      {/* TOP: square-variant */}
      <div className="square-variant">
        <TeaserDuo
          left={hasSeriesTopOverride ? seriesTopLeft : topLeft}
          leftHover={hasSeriesTopOverride ? seriesTopLeftHover : topLeftHover}
          right={hasSeriesTopOverride ? seriesTopRight : topRight}
          rightHover={
            hasSeriesTopOverride ? seriesTopRightHover : topRightHover
          }
          isSingle={false}
          content={
            hasSeriesTopOverride
              ? seriesDescriptionText
              : product.descriptionHtml
          }
        />
      </div>

      {/* MAIN: Configurator + Gallery */}
      <ProductMain
        product={product}
        selectedVariant={selectedVariant}
        seriesProducts={seriesProducts}
        seriesActiveIndex={seriesActiveIndex}
        onChangeSeriesProduct={onChangeSeriesProduct}
        seriesConfigurator={seriesConfigurator}
        seriesMeta={seriesMeta}
      />

      {/* BELOW MAIN: Band + TeaserDuo */}
      <HeroSplit_GalleryBand
        leftImg={heroSplitLeftImage}
        leftHoverImg={heroSplitLeftHover}
        rightImg={heroSplitRightImage}
        rightHoverImg={heroSplitRightHover}
        heroSplitText={heroSplitText}
      />

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
