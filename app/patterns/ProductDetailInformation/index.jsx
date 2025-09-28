import {ProductImage} from '~/patterns/ProductImage';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {ProductDetail} from './ProductDetail';

export function ProductDetailInformation({product}) {
  // in Product (routes/products.$handle.jsx)


  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const imageNodes = product.images?.edges?.map((edge) => edge.node) || [];

  const mainImage = imageNodes[0];
  const secondImage = imageNodes[1];

  return (
    <div className="pdp">
      <TeaserDuo
        teaserImageLeft={<ProductImage image={mainImage} />}
        teaserImageRight={<ProductImage image={secondImage} />}
        content={
          <div dangerouslySetInnerHTML={{__html: product.description}} />
        }
      />

      <ProductDetail product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
