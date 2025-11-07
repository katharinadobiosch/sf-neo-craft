import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';

function HoverImagePair({image, hoverImage, className}) {
  return (
    <div className={`${className} hover-wrap`}>
      <Image data={image} sizes="100vw" />
      <Image data={hoverImage} sizes="" className="hover-img" />
    </div>
  );
}

export function HeroSplit() {
  const {metafields} = useLoaderData();

  const heroSplitText = metafields?.hero_split_text?.value || '';
  const [heroSplitLeft, heroSplitLeftHover] =
    metafields?.hero_split_links?.list || [];
  const [heroSplitRight, heroSplitRightHover] =
    metafields?.hero_split_rechts?.list || [];

  return (
    <section className="hero-split" aria-label="Hero split">
      <div className="hero-split__left">
        <HoverImagePair
          image={heroSplitLeft}
          hoverImage={heroSplitLeftHover}
          className="hero-split__left-img"
        />
        <div className="hero-split__quote">
          <div className="hero-split__quote-inner">{heroSplitText}</div>
        </div>
      </div>

      <div className="hero-split__right">
        <HoverImagePair
          image={heroSplitRight}
          hoverImage={heroSplitRightHover}
          className="hero-split__right-img"
        />
      </div>
    </section>
  );
}
