import {useLoaderData} from 'react-router';
import {Image, type HydrogenImage} from '@shopify/hydrogen';

type ImgLike = HydrogenImage | string | null | undefined;

function HoverImage({
  image,
  hoverImage,
  className = '',
  sizes = '100vw',
}: {
  image: ImgLike;
  hoverImage?: ImgLike;
  className?: string;
  sizes?: string;
}) {
  if (!image) return null;

  const renderBase = (img: ImgLike, extra = '') => {
    if (typeof img === 'string') {
      return <img src={img} alt="" className={extra} />;
    }
    // Hydrogen-Objekt
    return (
      <Image data={img as HydrogenImage} sizes={sizes} className={extra} />
    );
  };

  return (
    <div className={`hs-img ${className}`}>
      {renderBase(image)}
      {hoverImage ? renderBase(hoverImage, 'hs-img__hover') : null}
    </div>
  );
}

type HeroSplitProps = {
  // Slots
  leftTop?: React.ReactNode;
  leftBottom?: React.ReactNode;
  right?: React.ReactNode;

  // Decor / options
  showDivider?: boolean; // vertikale Linie in der Mitte
  rightAspect?: string; // z.B. "780/941"
  leftTopAspect?: string; // z.B. "781/520"
  leftBottomAspect?: string; // z.B. "781/422"
  bandDecor?: 'left' | 'right' | null; // farbige Bandfläche wie im 3. Screen
  bandColor?: string; // CSS var / Hex
  className?: string;
  ariaLabel?: string;
};

export function HeroSplit({
  leftTop,
  leftBottom,
  right,
  showDivider = true,
  rightAspect = '3/4',
  leftTopAspect = '4/3',
  leftBottomAspect = '4/3',
  bandDecor = null,
  bandColor = 'var(--sf-purple, #8F8CF6)',
  className = '',
  ariaLabel = 'Hero split',
}: HeroSplitProps) {
  return (
    <section
      className={`hero-split ${className}`}
      aria-label={ariaLabel}
      style={
        {
          '--hs-right-aspect': rightAspect,
          '--hs-leftTop-aspect': leftTopAspect,
          '--hs-leftBottom-aspect': leftBottomAspect,
          '--hs-band-color': bandColor,
        } as React.CSSProperties
      }
      data-divider={showDivider ? 'on' : 'off'}
      data-band={bandDecor ?? 'none'}
    >
      <div className="hs-grid">
        <div className="hs-cell hs-leftTop">{leftTop}</div>
        <div className="hs-cell hs-leftBottom">{leftBottom}</div>
        <div className="hs-cell hs-right">{right}</div>
      </div>
    </section>
  );
}

/* ===========================
   Beispiele: 3 Varianten
   =========================== */

export function HeroSplit_ClassicFromMetafields() {
  const data = useLoaderData() as any;
  const mf = data?.product?.metafields ?? data?.metafields ?? {};
  const text = mf?.hero_split_text?.value ?? '';

  const [left, leftHover] = mf?.hero_split_links?.list || [];
  const [rightImg, rightHover] = mf?.hero_split_rechts?.list || [];

  return (
    <HeroSplit
      rightAspect="780/941"
      leftTopAspect="781/520"
      leftBottomAspect="781/422"
      bandDecor={null}
      leftTop={<HoverImage image={left} hoverImage={leftHover} />}
      leftBottom={
        <blockquote className="hs-quote">
          <div className="hs-quote__inner">{text}</div>
        </blockquote>
      }
      right={<HoverImage image={rightImg} hoverImage={rightHover} />}
    />
  );
}

export function HeroSplit_Poster({
  graphicColor = '#F6A94A',
  quote,
  leftImg,
  rightImg,
}: {
  graphicColor?: string;
  quote: string;
  leftImg?: ImgLike;
  rightImg?: ImgLike;
}) {
  return (
    <HeroSplit
      rightAspect="780/940"
      leftTopAspect="788/520"
      leftBottomAspect="788/420"
      bandDecor={null}
      leftTop={
        <div className="hs-graphic" style={{background: graphicColor}} />
      }
      leftBottom={
        <blockquote className="hs-quote hs-quote--light">
          <div className="hs-quote__inner">{quote}</div>
        </blockquote>
      }
      right={<HoverImage image={rightImg} />}
    />
  );
}

export function HeroSplit_GalleryBand({
  leftImg,
  rightImg,
  bandColor = '#8F8CF6', // lila Band wie Screenshot 3
}: {
  leftImg?: ImgLike;
  rightImg?: ImgLike;
  bandColor?: string;
}) {
  return (
    <HeroSplit
      rightAspect="3/4"
      leftTopAspect="3/2"
      leftBottomAspect="3/2"
      bandDecor="left"
      bandColor={bandColor}
      leftTop={<HoverImage image={leftImg} />}
      leftBottom={<div className="hs-spacer" />}
      right={<HoverImage image={rightImg} />}
    />
  );
}
