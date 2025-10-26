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

  //metafields
  // product_tile;
  // produkt_duo_top_rechts;
  // produkt_duo_top_links;
  // hero_split_links;
  // hero_split_rechts;
  // teaser_duo_bottom_links;
  // teaser_duo_bottom_rechts;

  const untenLinks = metafields?.teaser_duo_bottom_links?.list[0];
  const untenLinksHover = metafields?.teaser_duo_bottom_links_hover?.list[1];

  const untenRechts = metafields?.teaser_duo_bottom_rechts?.list[0];
  const untenRechtsHover = metafields?.teaser_duo_bottom_rechts_hover?.list[1];

  const obenLinks = metafields?.produkt_duo_top_links?.list[0];
  const obenLinksHover = metafields?.produkt_duo_top_links_hover?.list[1];
  
  const obenRechts = metafields?.produkt_duo_top_rechts?.list[0];
  const obenRechtsHover = metafields?.produkt_duo_top_rechts_hover?.list[1];



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
