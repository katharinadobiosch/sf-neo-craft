import * as React from 'react';
import {useLoaderData} from 'react-router';
import {Image} from '@shopify/hydrogen';

type HydrogenImageData = React.ComponentProps<typeof Image>['data'];
type ImgLike = HydrogenImageData | string | null | undefined;

export function HoverImage({
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
    if (!img) return null;

    if (typeof img === 'string') {
      return <img src={img} alt="" className={extra} />;
    }

    return <Image data={img} sizes={sizes} className={extra} />;
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
  rightAspect = '781/941',
  leftTopAspect = '781/520',
  leftBottomAspect = '781/422',
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

type MetafieldText = {value?: string | null};
type MetafieldList = {list?: unknown[]};

type LoaderLike = {
  product?: {metafields?: Record<string, unknown> | null} | null;
  metafields?: Record<string, unknown> | null;
};

function asRecord(x: unknown): Record<string, unknown> {
  return x && typeof x === 'object' ? (x as Record<string, unknown>) : {};
}

function asList(x: unknown): unknown[] {
  if (!x || typeof x !== 'object') return [];
  const list = (x as MetafieldList).list;
  return Array.isArray(list) ? list : [];
}

export function HeroSplit_ClassicFromMetafields() {
  const data = useLoaderData() as unknown as LoaderLike;

  const mf =
    asRecord(data?.product?.metafields) ?? asRecord(data?.metafields) ?? {};

  const text =
    (mf.hero_split_text as MetafieldText | undefined)?.value?.toString() ?? '';

  const leftList = asList(mf.hero_split_links);
  const rightList = asList(mf.hero_split_rechts);

  const [left, leftHover] = leftList as ImgLike[];
  const [rightImg, rightHover] = rightList as ImgLike[];

  return (
    <HeroSplit
      rightAspect="781/941"
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
  leftTop,
  graphicColor = '#F6A94A',
  quote,
  rightImg,
}: {
  leftTop?: React.ReactNode;
  graphicColor?: string;
  quote: string;
  rightImg?: ImgLike;
}) {
  return (
    <HeroSplit
      rightAspect="781/941"
      leftTopAspect="781/520"
      leftBottomAspect="781/422"
      bandDecor={null}
      leftTop={
        leftTop ?? (
          <div className="hs-graphic" style={{background: graphicColor}} />
        )
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
  bandColor = '#8F8CF6',
}: {
  leftImg?: ImgLike;
  rightImg?: ImgLike;
  bandColor?: string;
}) {
  return (
    <HeroSplit
      rightAspect="781/941"
      leftTopAspect="781/520"
      leftBottomAspect="781/422"
      bandDecor="left"
      bandColor={bandColor}
      leftTop={<HoverImage image={leftImg} />}
      leftBottom={
        <div className="hs-bandDecor" aria-hidden="true">
          <span className="hs-bandDecor__n">N</span>
          <span className="hs-bandDecor__c">C</span>
        </div>
      }
      right={<HoverImage image={rightImg} />}
    />
  );
}
