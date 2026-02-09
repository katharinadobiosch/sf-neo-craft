import {useState, useCallback} from 'react';
import {ProductForm} from './ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';

import {
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

export function ProductMain({
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

  const [reselectKey, setReselectKey] = useState(0);

  const handleVariantReselect = useCallback(() => {
    setReselectKey((k) => k + 1);
  }, []);

  return (
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
        <MediaGallery
          product={product}
          variant={selectedVariant}
          reselectKey={reselectKey}
        />
      </div>
    </div>
  );
}
