// app/patterns/ProductDetailInformation/ProductMain.jsx
import {ProductForm} from '~/patterns/ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';
import {HeroSplit_GalleryBand} from '../HeroSplit';
import {TeaserDuo} from '../TeaserDuo';

import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

export function ProductMain({
  product,
  metafields,
  selectedVariant,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {

  // const selectedVariant = useOptimisticVariant(
  //   product.selectedOrFirstAvailableVariant,
  //   getAdjacentAndFirstAvailableVariants(product),
  // );

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const imageNodes = product.images?.edges?.map((edge) => edge.node) ?? [];

  const mainImage = imageNodes?.[3]?.url ?? imageNodes?.[0]?.url ?? null;

  const thirdImage =
    imageNodes?.[2]?.url ??
    imageNodes?.[1]?.url ??
    imageNodes?.[0]?.url ??
    null;

  // 👉 Metafelder kommen als Prop (schon normalisiert)
  const productDuoTopLeft = metafields?.teaser_duo_bottom_links?.list?.[0]?.url;
  const productDuoTopLeftHover =
    metafields?.teaser_duo_bottom_links?.list?.[1]?.url;
  const productDuoTopRight =
    metafields?.teaser_duo_bottom_rechts?.list?.[0]?.url;
  const productDuoTopRightHover =
    metafields?.teaser_duo_bottom_rechts?.list?.[1]?.url;

  return (
    <>
      <div className="product-main">
        <div className="product-main__info">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            product={product}
            seriesProducts={seriesProducts}
            seriesActiveIndex={seriesActiveIndex}
            onChangeSeriesProduct={onChangeSeriesProduct}
          />
        </div>

        <div className="product-main__media">
          <MediaGallery product={product} variant={selectedVariant} />
        </div>
      </div>

      <HeroSplit_GalleryBand leftImg={thirdImage} rightImg={mainImage} />
      <TeaserDuo
        className="pdp__teaser-duo"
        left={productDuoTopLeft}
        leftHover={productDuoTopLeftHover}
        right={productDuoTopRight}
        rightHover={productDuoTopRightHover}
      />
    </>
  );
}
