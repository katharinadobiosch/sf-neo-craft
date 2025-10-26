import {useLoaderData} from 'react-router';
import {ProductImage} from '~/patterns/ProductImage';
import {Image} from '@shopify/hydrogen';

export function HeroSplit({imageLeftTop, imageRight, content, product}) {
  // hero_split_text;
  // hero_split_links;
  // hero_split_rechts;

  const {metafields} = useLoaderData();
  const heroSplitText = metafields?.hero_split_text?.value || '';
  const heroSplitLinks = metafields?.hero_split_links?.list[0] || [];
  const heroSplitRechts = metafields?.hero_split_rechts?.list[0] || [];

  console.log('metafields100', metafields);

  return (
    <section className="hero-split" aria-label="Hero split">
      <div className="hero-split__left">
        <div className="hero-split__left-img">
          <Image data={heroSplitLinks} sizes="100vw" />
        </div>
        <div className="hero-split__quote">
          <div className="hero-split__quote-inner">{heroSplitText}</div>
        </div>
      </div>

      <div className="hero-split__right">
        <div className="hero-split__right-img">
          <Image data={heroSplitRechts} sizes="100vw" />
        </div>
      </div>
    </section>
  );
}
