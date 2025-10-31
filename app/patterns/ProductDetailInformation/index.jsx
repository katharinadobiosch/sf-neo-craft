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

  const productDuoTopLeft = metafields?.produkt_duo_top_links?.list[0];
  const productDuoTopLeftHover = metafields?.produkt_duo_top_links?.list[1];

  const productDuoTopRight = metafields?.produkt_duo_top_rechts?.list[0];
  const productDuoTopRightHover = metafields?.produkt_duo_top_rechts?.list[1];

  console.log('hover', productDuoTopLeftHover);

  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          teaserImageLeft={
            <div className="hover-wrap">
              <div className="base-img">
                <ProductImage image={productDuoTopLeft} />
              </div>
              <div className="hover-img">
                <ProductImage image={productDuoTopLeftHover} />
              </div>
            </div>
          }
          teaserImageRight={
            <div className="hover-wrap">
              <div className="base-img">
                <ProductImage image={productDuoTopRight} />
              </div>
              <div className="hover-img">
                <ProductImage image={productDuoTopRightHover} />
              </div>
            </div>
          }
          content={
            <div dangerouslySetInnerHTML={{__html: product.description}} />
          }
        />
      </div>

      <ProductMain product={product} selectedVariant={selectedVariant} />
    </div>
  );
}
