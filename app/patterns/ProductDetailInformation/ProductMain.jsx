import {ProductForm} from '~/patterns/ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';
import {HeroSplit_GalleryBand} from '../HeroSplit';
import {TeaserDuo} from '../TeaserDuo';
import {useLoaderData} from 'react-router';

import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

export function ProductMain({product}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

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

  const {metafields} = useLoaderData();

  const productDuoTopLeft = metafields?.teaser_duo_bottom_links?.list[0].url;
  const productDuoTopLeftHover =
    metafields?.teaser_duo_bottom_links?.list[1].url;
  const productDuoTopRight = metafields?.teaser_duo_bottom_rechts?.list[0].url;
  const productDuoTopRightHover =
    metafields?.teaser_duo_bottom_rechts?.list[1].url;

  return (
    <>
      <div className="product-main">
        <div className="product-main__info">
          <ProductForm
            productOptions={productOptions}
            selectedVariant={selectedVariant}
            product={product}
          />
        </div>

        <div className="product-main__media">
          <MediaGallery product={product} variant={selectedVariant} />
        </div>
      </div>
      {/* <HeroSplit
        className="pdp__hero-split"
        imageLeftTop={thirdImage || undefined}
        imageRight={mainImage || undefined}
        content="The GOBA table lamp, made from mouth-blown crystal glass and stainless steel, draws inspiration from the captivating process of mushroom growth. Available in three sizes and glass types—clear, opal, and frosted—it offers versatile lighting options. The integrated OLED light source provides soft, dimmable illumination via touch control. The slightly protruding metal base, in stainless steel or brass, adds a bold accent. Perfect for use individually or in groups, GOBA enhances any space with its unique aesthetic and ambiance."
      /> */}
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
