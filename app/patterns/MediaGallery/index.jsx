import {Swiper, SwiperSlide} from 'swiper/react';
import {Pagination, A11y} from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

import './mediaGallery.scss';

export function MediaGallery({product}) {
  return (
    <div className="media-gallery">
      <Swiper
        modules={[Pagination, A11y]}
        slidesPerView={1}
        pagination={{clickable: true}}
        loop
      >
        {product?.adjacentVariants?.map((variant) => (
          <SwiperSlide key={variant.id}>
            <img
              src={variant.image?.url}
              alt={variant.title ?? 'Produktbild'}
              loading="lazy"
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
