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
  seriesMeta,
}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const metafields = normalizeAllMetafields(product.metafields ?? []);

  const seriesLeft = seriesMeta?.hero_links?.[0] ?? null;
  const seriesLeftHover = seriesMeta?.hero_links?.[1] ?? null;

  const seriesRight = seriesMeta?.hero_rechts?.[0] ?? null;
  const seriesRightHover = seriesMeta?.hero_rechts?.[1] ?? null;

  const hasSeriesOverride = Boolean(seriesMeta && (seriesLeft || seriesRight));
  const seriesIntroText = richTextJsonToPlainText(seriesMeta?.intro);

  // ===== TOP (Square Variant): Series-Hero ODER Standard-Duo + Description =====
  const topLeft = metafields?.produkt_duo_top_links?.list?.[0]?.url;
  const topLeftHover = metafields?.produkt_duo_top_links?.list?.[1]?.url;

  const topRight = metafields?.produkt_duo_top_rechts?.list?.[0]?.url;
  const topRightHover = metafields?.produkt_duo_top_rechts?.list?.[1]?.url;

  const seriesHero = metafields?.series_hero;
  const seriesImage = seriesHero?.list?.[0]?.url;
  const seriesImageHover = seriesHero?.list?.[1]?.url;
  const hasSeriesHero = Boolean(seriesImage);

  // ===== HERO SPLIT (Band): aus Metafeldern (jeweils [0]=main, [1]=hover) =====
  const heroSplitLeftImage =
    metafields?.hero_split_links?.list?.[0]?.url ?? null;
  const heroSplitLeftHover =
    metafields?.hero_split_links?.list?.[1]?.url ?? null;

  const heroSplitRightImage =
    metafields?.hero_split_rechts?.list?.[0]?.url ?? null;
  const heroSplitRightHover =
    metafields?.hero_split_rechts?.list?.[1]?.url ?? null;
  const heroSplitText = metafields?.hero_split_text?.value ?? '';

  // ===== BOTTOM TeaserDuo (aus Metafeldern) =====
  const bottomLeft = metafields?.teaser_duo_bottom_links?.list?.[0]?.url;
  const bottomLeftHover = metafields?.teaser_duo_bottom_links?.list?.[1]?.url;

  const bottomRight = metafields?.teaser_duo_bottom_rechts?.list?.[0]?.url;
  const bottomRightHover = metafields?.teaser_duo_bottom_rechts?.list?.[1]?.url;

  const seriesIntro = seriesMeta?.intro ?? null;

  const hasSeriesHeroOverride = Boolean(seriesLeft || seriesRight);
  const topContent = seriesIntro ? seriesIntro : product.descriptionHtml;

  return (
    <div className="pdp">
      {/* TOP: square-variant */}
      <div className="square-variant">
        <TeaserDuo
          left={hasSeriesOverride ? seriesLeft : hasSeriesHero ? null : topLeft}
          leftHover={
            hasSeriesOverride
              ? seriesLeftHover
              : hasSeriesHero
                ? seriesImageHover
                : topLeftHover
          }
          right={
            hasSeriesOverride ? seriesRight : hasSeriesHero ? null : topRight
          }
          rightHover={
            hasSeriesOverride
              ? seriesRightHover
              : hasSeriesHero
                ? null
                : topRightHover
          }
          isSingle={hasSeriesOverride ? !seriesRight : hasSeriesHero}
          content={
            hasSeriesOverride ? seriesIntroText : product.descriptionHtml
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
