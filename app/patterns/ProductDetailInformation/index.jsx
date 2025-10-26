import {ProductImage} from '~/patterns/ProductImage';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import {TeaserDuo} from '../TeaserDuo';
import {ProductMain} from './ProductMain';
import {useLoaderData} from 'react-router';

export function ProductDetailInformation({product}) {
  const {metafields} = useLoaderData();

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  console.log('ProductDetailInformation render', {product, metafields});

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
            <div>test</div>
            // <div dangerouslySetInnerHTML={{__html: product.description}} />
          }
        />
      </div>

      <ProductMain product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
