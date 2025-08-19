import {useMemo} from 'react';
import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, A11y} from 'swiper/modules';

export function MediaGallery({product, variant}) {
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

  return (
    <div className="media-gallery">
      <Swiper
        key={variant?.id || 'default'}
        modules={[Pagination, A11y]}
        slidesPerView={1}
        loop={hasMultiple}
        pagination={hasMultiple ? {clickable: true} : undefined}
      >
        {slides.map((s) => (
          <SwiperSlide key={s.id}>
            <img
              src={s.url}
              alt={s.alt || ''}
              width={s.width}
              height={s.height}
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
