import {ProductImage} from '~/patterns/ProductImage';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
} from '@shopify/hydrogen';
import './productDetailInformation.scss';
import {TeaserDuo} from '../TeaserDuo';
import {ProductMain} from './ProductMain';

export function ProductDetailInformation({product}) {
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // console.log('ProductDetailInformation product', product);

  return (
    <div className="pdp">
      <TeaserDuo
        teaserImageLeft={<ProductImage image={selectedVariant?.image} />}
        teaserImageRight={<ProductImage image={selectedVariant?.image} />}
        content="The GOBA table lamp, made from mouth-blown crystal glass and stainless steel, draws inspiration from the captivating process of mushroom growth. Available in three sizes and glass types—clear, opal, and frosted—it offers versatile lighting options. The integrated OLED light source provides soft, dimmable illumination via touch control. The slightly protruding metal base, in stainless steel or brass, adds a bold accent. Perfect for use individually or in groups, GOBA enhances any space with its unique aesthetic and ambiance."
      />

      <ProductMain product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
