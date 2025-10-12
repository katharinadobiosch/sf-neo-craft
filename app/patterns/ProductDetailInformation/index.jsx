import {ProductImage} from '~/patterns/ProductImage';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {ProductMain} from './ProductMain';

export function ProductDetailInformation({product}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  const imageNodes = product.images?.edges?.map((edge) => edge.node) || [];

  const mainImage = imageNodes[0];
  const secondImage = imageNodes[1];

  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          teaserImageLeft={<ProductImage image={mainImage} />}
          teaserImageRight={<ProductImage image={secondImage} />}
          content={
            <div dangerouslySetInnerHTML={{__html: product.description}} />
          }
        />
      </div>

      <ProductMain product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
