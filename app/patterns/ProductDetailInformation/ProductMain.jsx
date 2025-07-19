import {ProductPrice} from '~/patterns/ProductPrice';
import {ProductForm} from '~/patterns/ProductForm';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import './productDetailInformation.scss';

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
      <h1>{product.title}</h1>
      <ProductPrice
        price={selectedVariant?.price}
        compareAtPrice={selectedVariant?.compareAtPrice}
      />
      <br />
      <ProductForm
        productOptions={productOptions}
        selectedVariant={selectedVariant}
      />
      <br />
      <br />
      <p>
        <strong>Description</strong>
      </p>
      <br />
      <div dangerouslySetInnerHTML={{__html: product.descriptionHtml}} />
      <br />
    </div>
  );
}
