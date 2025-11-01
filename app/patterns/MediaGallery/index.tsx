import React, {useState, useEffect, useMemo, useRef} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Navigation, A11y, Pagination} from 'swiper/modules';

import classnames from 'classnames';
import {Thumbs, Navigation} from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import type SwiperOptions from 'swiper';

type Img = {
  id: string;
  url: string;
  alt?: string | null;
  width?: number | null;
  height?: number | null;
};

type Props = {
  product: any;
  variant?: any;
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
    loop: hasMultiple,
    pagination: hasMultiple ? {clickable: true} : undefined,
    touchStartPreventDefault: false,
    allowTouchMove: true,
    speed: 500,
    breakpoints: {
      720: {slidesPerView: 1, spaceBetween: 30},
    },
  };

  // 1) Key sorgt für sauberes Remount bei Variantenwechsel ODER Slide-Änderungen
  const swiperKey = `${variant?.id ?? 'default'}|${slides.map((s) => s.id).join(',')}`;

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
        key={swiperKey} // <- remount
        modules={[Navigation, A11y]}
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
