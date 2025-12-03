// app/patterns/ProductDetailInformation/ProductMain.jsx
import {ProductForm} from '~/patterns/ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';
import {HeroSplit_GalleryBand} from '../HeroSplit';
import {TeaserDuo} from '../TeaserDuo';
import {MaterialForm} from './MaterialForm';

import {
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {normalizeAllMetafields} from '~/utils/metafields';

export function MaterialMain({
  product,
  selectedVariant,
  seriesProducts,
  seriesActiveIndex,
  onChangeSeriesProduct,
}) {
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const description = product?.descriptionHtml ?? product?.description;

  return (
    <>
      <div className="product-main">
        <div className="product-main__info">
          <div
            className="pdp-materials__text"
            dangerouslySetInnerHTML={{__html: description}}
          />
          <MaterialForm
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

      {/* <HeroSplit_GalleryBand leftImg={thirdImage} rightImg={mainImage} />
      <TeaserDuo
        className="pdp__teaser-duo"
        left={productDuoTopLeft}
        leftHover={productDuoTopLeftHover}
        right={productDuoTopRight}
        rightHover={productDuoTopRightHover}
      /> */}
    </>
  );
}
