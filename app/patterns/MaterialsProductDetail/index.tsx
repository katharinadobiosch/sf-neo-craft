/* eslint-disable @typescript-eslint/no-explicit-any */
import {Image} from '@shopify/hydrogen';
import {MaterialMain} from './MaterialMain';
export function MaterialsProductDetail({product}: {product: any}) {
  const hero = product?.featuredImage;

  return (
    <div className="pdp-materials">
      <section className="pdp-materials__hero">
        {hero ? (
          <Image
            data={hero}
            alt={hero.altText ?? product?.title}
            className="pdp-materials__heroImage"
          />
        ) : null}
      </section>

      {/* <section className="pdp-materials__content">
        <h1 className="pdp-materials__title">{product?.title}</h1>
      </section> */}

      {/* wenn du trotzdem den normalen Add-to-Cart-Block willst */}
      <MaterialMain
        product={product}
        selectedVariant={{}}
        seriesProducts={[]}
        seriesActiveIndex={0}
        onChangeSeriesProduct={() => {}}
      />
    </div>
  );
}
