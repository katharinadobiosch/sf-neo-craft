import React, {useState, useEffect, useMemo} from 'react';
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

  return (
    <section className={`nc-media-gallery ${className ?? ''}`}>
      <Swiper
        modules={[Navigation, A11y]}
        className="nc-swiper-content"
        slidesPerView={1}
        loop={hasMultiple}
        navigation
        speed={500}
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
