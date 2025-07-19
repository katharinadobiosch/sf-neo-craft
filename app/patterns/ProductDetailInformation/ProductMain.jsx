import {ProductPrice} from '~/patterns/ProductPrice';
import {ProductForm} from '~/patterns/ProductForm';
import {MediaGallery} from '~/patterns/MediaGallery';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import './productDetailInformation.scss';
import {Configurator} from '../Configurator';

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
  return (
    <div className="product-main">
      <div className="product-main__info">
        <h1>{product.title}</h1>
        <Configurator />
        <ProductPrice
          price={selectedVariant?.price}
          compareAtPrice={selectedVariant?.compareAtPrice}
        />
        <ProductForm
          productOptions={productOptions}
          selectedVariant={selectedVariant}
        />
        <p>
          <strong>Description</strong>
        </p>
        <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
      </div>
      <div className="product-main__media">
        <MediaGallery />
      </div>
    </div>
  );
}
