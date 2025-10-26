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

  console.log('metafields', metafields);
  const obenLinks = metafields.produkt_duo_top_links_hover.list[0];
  const obenLinksHover = metafields.produkt_duo_top_links_hover.list[1];

  const obenRechts = metafields.teaser_duo_top_right.list[0];
  const obenRechtsHover = metafields.teaser_duo_top_right.list[1];

  console.log('obenLinks', obenLinks, obenLinksHover);

  return (
    <div className="pdp">
      <div className="square-variant">
        <TeaserDuo
          teaserImageLeft={
            <div className="hover-wrap">
              <ProductImage image={obenLinks} />
              <ProductImage image={obenLinksHover} className="hover-img" />
            </div>
          }
          teaserImageRight={
            <div className="hover-wrap">
              <ProductImage image={obenRechts} />
              <ProductImage image={obenRechtsHover} className="hover-img" />
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
