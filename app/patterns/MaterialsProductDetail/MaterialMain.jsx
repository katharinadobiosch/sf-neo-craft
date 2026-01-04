// app/patterns/ProductDetailInformation/ProductMain.jsx
import {MediaGallery} from '~/patterns/MediaGallery';
import {MaterialForm} from './MaterialForm';
import {ProductForm} from '@/patterns/ProductDetailInformation/ProductForm';

import {
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

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
    <div className="pdp">
      <div className="product-main">
        <div className="product-main__info">
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
    </div>
  );
}
