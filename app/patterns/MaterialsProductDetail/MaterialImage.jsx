
import {Image} from '@shopify/hydrogen';

import './productDetailInformation.scss';

/**
 * @param {{
 *   image: ProductVariantFragment['image'];
 * }}
 */
export function MaterialImage({image}) {
  if (!image) {
    return <div className="product-image" />;
  }
  return (
    <div className="product-image">
      <Image
        alt={image.altText || 'Product Image'}
        // aspectRatio="1/1"
        data={image}
        // key={image.id}
        sizes="(min-width: 45em) 50vw, 100vw"
      />
      <Image
        alt={image.altText || 'Product Image'}
        // aspectRatio="1/1"
        data={image}
        // key={image.id}

        sizes="(min-width: 45em) 50vw, 100vw"
      />
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
