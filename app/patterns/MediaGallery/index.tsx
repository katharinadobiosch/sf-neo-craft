import React, {useEffect, useMemo, useRef} from 'react';
import type {Swiper as SwiperType} from 'swiper';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, Pagination, A11y} from 'swiper/modules';



type ImageNode = {
  id: string;
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type Product = {
  title?: string | null;
  images?: {edges: {node: ImageNode}[]} | null;
};

type Variant = {
  id?: string | number | null;
  title?: string | null;
  image?: ImageNode | null;
};

type Props = {
  product: Product;
  variant?: Variant | null;
  className?: string;
};

export function MediaGallery({product, variant, className}: Props) {
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = useMemo(() => {
    const list = [];

    // 1) Variantenbild zuerst
    if (variant?.image?.url) {
      list.push({
        id: variant.image.id || `var-${variant.id}`,
        url: variant.image.url,
        alt: variant.image.altText ?? variant.title ?? product?.title,
        width: variant.image.width,
        height: variant.image.height,
      });
    }

    // 2) Danach alle Produktbilder
    for (const {node} of product?.images?.edges ?? []) {
      list.push({
        id: node.id,
        url: node.url,
        alt: node.altText ?? product?.title,
        width: node.width,
        height: node.height,
      });
    }

    // 3) Duplikate (gleiche URL) entfernen
    const seen = new Set();
    return list.filter((s) => !seen.has(s.url) && seen.add(s.url));
  }, [variant, product]);

  if (!slides.length) return null;

  const hasMultiple = slides.length > 1;

  const galleryOptions = {
    slidesPerView: 1,
    spaceBetween: 12,
    navigation: true,
    // loop: hasMultiple,
    pagination: hasMultiple ? {clickable: true} : undefined,
    touchStartPreventDefault: false,
    allowTouchMove: true,
    speed: 500,
    breakpoints: {
      720: {slidesPerView: 1, spaceBetween: 30},
    },
  };

  // 1) Key sorgt für sauberes Remount bei Variantenwechsel ODER Slide-Änderungen

  // 2) Beim Variantenwechsel aktiv auf das Variantenbild springen
  useEffect(() => {
    if (!swiperRef.current) return;
    const vUrl = variant?.image?.url;
    if (!vUrl) return;
    const idx = slides.findIndex((s) => s.url === vUrl);
    if (idx < 0) return;

    const s = swiperRef.current;
    if (s.params.loop) {
      s.slideToLoop(idx, 0, false);
    } else {
      s.slideTo(idx, 0, false);
    }
  }, [variant?.id, slides]); // absichtlich an id & slides gekoppelt

  return (
    <section className={`nc-media-gallery ${className ?? ''}`}>
      <Swiper
        {...galleryOptions}
        key={variant?.id || 'default'}
        modules={[Navigation, Pagination, A11y]}
        loop={hasMultiple}
        navigation={hasMultiple ? true : false}
        // pagination={hasMultiple ? {clickable: true} : undefined}
        className="nc-swiper-content"
        onSwiper={(inst) => {
          swiperRef.current = inst;
        }}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <img
              src={s.url}
              alt={s.alt || ''}
              width={s.width ?? undefined}
              height={s.height ?? undefined}
              loading="lazy"
              decoding="async"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
