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

  const topLeft = metafields?.produkt_duo_top_links?.list[0].url;
  const topLeftHover = metafields?.produkt_duo_top_links?.list[1].url;

  const topRight = metafields?.produkt_duo_top_rechts?.list[0].url;
  const topRightHover = metafields?.produkt_duo_top_rechts?.list[1].url;


  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          left={topLeft}
          leftHover={topLeftHover}
          rightHover={topRightHover}
          right={topRight}
          content={product.description}
        />
      </div>

      <ProductMain product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
