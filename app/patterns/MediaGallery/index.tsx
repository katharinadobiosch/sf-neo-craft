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

  // NEW: Refs für eigene Nav-Buttons
  const prevRef = useRef<HTMLButtonElement | null>(null);
  const nextRef = useRef<HTMLButtonElement | null>(null);

  const slides = useMemo(() => {
    const list: Array<{
      id: string;
      url: string;
      alt?: string | null;
      width?: number | null;
      height?: number | null;
    }> = [];

    if (variant?.image?.url) {
      list.push({
        id: variant.image.id || `var-${variant.id}`,
        url: variant.image.url,
        alt: variant.image.altText ?? variant.title ?? product?.title,
        width: variant.image.width,
        height: variant.image.height,
      });
    }

    for (const {node} of product?.images?.edges ?? []) {
      list.push({
        id: node.id,
        url: node.url,
        alt: node.altText ?? product?.title,
        width: node.width,
        height: node.height,
      });
    }

    const seen = new Set<string>();
    return list.filter((s) => !seen.has(s.url) && (seen.add(s.url), true));
  }, [variant, product]);

  if (!slides.length) return null;

  const hasMultiple = slides.length > 1;

  const galleryOptions = {
    slidesPerView: 1,
    spaceBetween: 12,
    pagination: hasMultiple ? {clickable: true} : undefined,
    touchStartPreventDefault: false,
    allowTouchMove: true,
    speed: 500,
    breakpoints: {
      720: {slidesPerView: 1, spaceBetween: 30},
    },
  };

  // Swiper an die Custom-Buttons binden (wichtig: nach Mount/Ref-Set)
  useEffect(() => {
    if (!hasMultiple) return;
    const s = swiperRef.current;
    if (!s) return;

    // Navigation-Params setzen (TS ist hier oft zu strikt)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const nav = (s.params.navigation ?? {}) as any;
    nav.prevEl = prevRef.current;
    nav.nextEl = nextRef.current;
    s.params.navigation = nav;

    // neu initialisieren/updaten
    s.navigation?.destroy?.();
    s.navigation?.init?.();
    s.navigation?.update?.();
  }, [hasMultiple]);

  // Beim Variantenwechsel aktiv auf das Variantenbild springen
  useEffect(() => {
    if (!swiperRef.current) return;
    const vUrl = variant?.image?.url;
    if (!vUrl) return;
    const idx = slides.findIndex((s) => s.url === vUrl);
    if (idx < 0) return;

    const s = swiperRef.current;
    if (s.params.loop) s.slideToLoop(idx, 0, false);
    else s.slideTo(idx, 0, false);
  }, [variant?.id, slides]);

  return (
    <section className={`nc-media-gallery ${className ?? ''}`}>
      {/* NEW: Eigene Buttons (Swiper erkennt sie über prevEl/nextEl) */}
      {hasMultiple && (
        <>
          <button
            ref={prevRef}
            type="button"
            className="nc-swiper-nav nc-swiper-nav--prev"
            aria-label="Vorheriges Bild"
          >
            <i className="fa-solid fa-chevron-left" aria-hidden="true" />
          </button>

          <button
            ref={nextRef}
            type="button"
            className="nc-swiper-nav nc-swiper-nav--next"
            aria-label="Nächstes Bild"
          >
            <i className="fa-solid fa-chevron-right" aria-hidden="true" />
          </button>
        </>
      )}

      <Swiper
        {...galleryOptions}
        key={variant?.id || 'default'}
        modules={[Navigation, Pagination, A11y]}
        loop={hasMultiple}
        // IMPORTANT: navigation muss aktiv sein, aber Elemente kommen aus useEffect/onMount
        navigation={hasMultiple}
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
