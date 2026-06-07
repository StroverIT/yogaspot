'use client';

import type { ReactNode } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = {
  prevClass: string;
  nextClass: string;
  bulletClass: string;
  bulletActiveClass: string;
  loop: boolean;
  autoplay?: boolean;
  slides: ReactNode[];
};

export default function HomeStudiosSwiper({
  prevClass,
  nextClass,
  bulletClass,
  bulletActiveClass,
  loop,
  autoplay = false,
  slides,
}: Props) {
  return (
    <Swiper
      modules={[Navigation, Pagination, ...(autoplay ? [Autoplay] : [])]}
      spaceBetween={24}
      slidesPerView={1}
      centeredSlides={false}
      loop={loop}
      grabCursor
      keyboard={{ enabled: true }}
      navigation={{
        enabled: true,
        prevEl: `.${prevClass}`,
        nextEl: `.${nextClass}`,
      }}
      pagination={{
        clickable: true,
        dynamicBullets: true,
        bulletClass,
        bulletActiveClass,
      }}
      autoplay={
        autoplay
          ? {
              delay: 5500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }
          : undefined
      }
      speed={650}
      breakpoints={{
        640: { slidesPerView: 2, slidesPerGroup: 2 },
        1024: { slidesPerView: 3, slidesPerGroup: 3 },
      }}
      className="studios-swiper !pb-14"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index} className="h-auto">
          {slide}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
