import {ProductImage} from '~/patterns/ProductImage';
import {ProductPrice} from '~/patterns/ProductPrice';
import {ProductForm} from '~/patterns/ProductForm';
import {
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import './productDetailInformation.scss';
import {TeaserDuo} from '../TeaserDuo';

export function ProductDetailInformation({product}) {
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
    <div className="pdp">
      <TeaserDuo
        teaserImageLeft={<ProductImage image={selectedVariant?.image} />}
        teaserImageRight={<ProductImage image={selectedVariant?.image} />}
        content="The GOBA table lamp, made from mouth-blown crystal glass and stainless steel, draws inspiration from the captivating process of mushroom growth. Available in three sizes and glass types—clear, opal, and frosted—it offers versatile lighting options. The integrated OLED light source provides soft, dimmable illumination via touch control. The slightly protruding metal base, in stainless steel or brass, adds a bold accent. Perfect for use individually or in groups, GOBA enhances any space with its unique aesthetic and ambiance."
      />
      {/* <ProductImage image={selectedVariant?.image} />
      <ProductImage image={selectedVariant?.image} /> */}

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
    </div>
  );
}
