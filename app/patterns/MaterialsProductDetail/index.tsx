// app/patterns/MaterialsProductDetail.tsx
import {Image} from '@shopify/hydrogen';
import {normalizeAllMetafields} from '~/utils/metafields';
import {ProductMain} from '../ProductDetailInformation/ProductMain'; // falls du den nutzen willst

export function MaterialsProductDetail({product}: {product: any}) {
  const metafields = normalizeAllMetafields(product.metafields ?? []);

  const hero = product?.featuredImage;
  const description = product?.descriptionHtml ?? product?.description;

  return (
    <div className="pdp pdp--materials">
      <section className="pdp-materials__hero">
        {hero ? (
          <Image
            data={hero}
            alt={hero.altText ?? product?.title}
            className="pdp-materials__heroImage"
          />
        ) : null}
      </section>

      <section className="pdp-materials__content">
        <h1 className="pdp-materials__title">{product?.title}</h1>
        <div
          className="pdp-materials__text"
          dangerouslySetInnerHTML={{__html: description}}
        />
      </section>

      {/* wenn du trotzdem den normalen Add-to-Cart-Block willst */}
      <ProductMain
        product={product}
        selectedVariant={{}}
        seriesProducts={[]}
        seriesActiveIndex={0}
        onChangeSeriesProduct={() => {}}
      />
    </div>
  );
}
