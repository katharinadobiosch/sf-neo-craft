import {useState, useEffect} from 'react';
// import {ProductPrice} from '~/patterns/ProductPrice';
import {ProductForm} from '~/patterns/ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';

import './productDetailInformation.scss';

export function ProductMain({product}) {
  console.log('ProductMain', product.metafields);
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const [selectedOptions, setSelectedOptions] = useState({
    size: selectedVariant.selectedOptions.find((o) => o.name === 'Size')?.value,
    glass: selectedVariant.selectedOptions.find(
      (o) => o.name === 'Glass coating',
    )?.value,
    metal: selectedVariant.selectedOptions.find(
      (o) => o.name === 'Metal surfaces & cable colour',
    )?.value,
    plug: 'EU',
    oled: '00',
  });

  function handleChange(name, value) {
    setSelectedOptions((prev) => ({...prev, [name]: value}));
    // optional: Matching Variant raussuchen und `setSelectedVariant(...)`
  }

  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  useEffect(() => {
    const matched = product.adjacentVariants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name.toLowerCase()] === opt.value,
      ),
    );
    if (matched) {
      setSelectedVariant(matched);
    }
  }, [selectedOptions]);

  return (
    <div className="product-main">
      <div className="product-main__info">
        <h1>{product.title}</h1>

        {/* <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        /> */}
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        {/* <p>
          <strong>Description</strong>
        </p> */}
        {/* <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} /> */}
      </div>
      <div className="product-main__media">
        <MediaGallery product={product} />
      </div>
    </div>
  );
}
