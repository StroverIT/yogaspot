'use client';

import { useState } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Keyboard, Pagination, A11y } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

const PLACEHOLDER_GRADIENTS = [
  'from-sage/45 via-primary/15 to-primary/25',
  'from-primary/20 via-sage/30 to-muted/80',
  'from-muted/60 via-sage/35 to-primary/20',
] as const;

const GALLERY_NAV_BTN_CLASS =
  'group absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-lg backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-200 hover:scale-[1.06] hover:border-white/45 hover:bg-black/55 hover:shadow-xl active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent md:h-12 md:w-12';

type GallerySlide = { id: string; src: string | null; caption: string };

export default function ImageGallerySwiper({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [gallerySwiper, setGallerySwiper] = useState<SwiperType | null>(null);

  const gallerySlides: GallerySlide[] =
    images.length > 0
      ? images.map((src, index) => ({
          id: `image-${index}`,
          src,
          caption: `${title} • Снимка ${index + 1} от ${images.length}`,
        }))
      : [
          { id: 'placeholder-1', src: null, caption: 'Практика' },
          { id: 'placeholder-2', src: null, caption: 'Спокойствие' },
          { id: 'placeholder-3', src: null, caption: 'Баланс' },
        ];

  const galleryCaptionBottom =
    gallerySlides.length > 1 ? 'bottom-14 md:bottom-16' : 'bottom-11 md:bottom-12';

  return (
    <div
      className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm [&_.swiper]:absolute [&_.swiper]:inset-0 [&_.swiper]:h-full [&_.swiper]:w-full
              [&_.swiper-wrapper]:h-full
              [&_.swiper-slide]:h-full
              [&_.swiper-pagination]:pointer-events-auto [&_.swiper-pagination]:z-10
              [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination]:!left-0 [&_.swiper-pagination]:!right-0 [&_.swiper-pagination]:!mx-auto [&_.swiper-pagination]:!w-max
              [&_.swiper-pagination]:flex [&_.swiper-pagination]:items-center [&_.swiper-pagination]:justify-center [&_.swiper-pagination]:gap-1.5
              [&_.swiper-pagination]:rounded-full [&_.swiper-pagination]:border [&_.swiper-pagination]:border-primary/25 [&_.swiper-pagination]:bg-black/35
              [&_.swiper-pagination]:px-3.5 [&_.swiper-pagination]:py-2.5 [&_.swiper-pagination]:shadow-lg [&_.swiper-pagination]:backdrop-blur-md
              [&_.swiper-pagination-bullet]:!m-0 [&_.swiper-pagination-bullet]:box-border [&_.swiper-pagination-bullet]:inline-flex
              [&_.swiper-pagination-bullet]:!h-2 [&_.swiper-pagination-bullet]:!w-2 [&_.swiper-pagination-bullet]:!min-h-0 [&_.swiper-pagination-bullet]:!min-w-0
              [&_.swiper-pagination-bullet]:shrink-0 [&_.swiper-pagination-bullet]:cursor-pointer [&_.swiper-pagination-bullet]:!rounded-full [&_.swiper-pagination-bullet]:border-0
              [&_.swiper-pagination-bullet]:!bg-primary [&_.swiper-pagination-bullet]:!opacity-100
              [&_.swiper-pagination-bullet]:transition-all [&_.swiper-pagination-bullet]:duration-300 [&_.swiper-pagination-bullet]:ease-out
              [&_.swiper-pagination-bullet]:hover:bg-primary/70
              [&_.swiper-pagination-bullet]:focus-visible:outline-none [&_.swiper-pagination-bullet]:focus-visible:ring-2 [&_.swiper-pagination-bullet]:focus-visible:ring-primary/55 [&_.swiper-pagination-bullet]:focus-visible:ring-offset-2 [&_.swiper-pagination-bullet]:focus-visible:ring-offset-transparent
              [&_.swiper-pagination-bullet-active]:!h-4 [&_.swiper-pagination-bullet-active]:!w-4 [&_.swiper-pagination-bullet-active]:!rounded-full
              [&_.swiper-pagination-bullet-active]:!bg-primary [&_.swiper-pagination-bullet-active]:shadow-[0_0_12px_-2px_color-mix(in_srgb,var(--primary)_55%,transparent)]
              [&_.swiper-pagination-bullet-active]:hover:bg-primary"
    >
      {gallerySlides.length > 1 && (
        <>
          <button
            type="button"
            className={`${GALLERY_NAV_BTN_CLASS} left-2.5 md:left-4`}
            aria-label="Предишна снимка"
            onClick={() => gallerySwiper?.slidePrev()}
          >
            <ChevronLeft
              className="h-5 w-5 transition-transform duration-200 group-hover:-translate-x-px md:h-6 md:w-6"
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
          <button
            type="button"
            className={`${GALLERY_NAV_BTN_CLASS} right-2.5 md:right-4`}
            aria-label="Следваща снимка"
            onClick={() => gallerySwiper?.slideNext()}
          >
            <ChevronRight
              className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-px md:h-6 md:w-6"
              strokeWidth={2.25}
              aria-hidden
            />
          </button>
        </>
      )}
      <Swiper
        modules={[Autoplay, Keyboard, Pagination, A11y]}
        loop={gallerySlides.length > 1}
        speed={480}
        grabCursor
        keyboard={{ enabled: true }}
        autoplay={
          gallerySlides.length > 1
            ? { delay: 5200, disableOnInteraction: true, pauseOnMouseEnter: true }
            : false
        }
        pagination={
          gallerySlides.length > 1
            ? { clickable: true, dynamicBullets: gallerySlides.length > 6 }
            : false
        }
        a11y={{
          enabled: true,
          prevSlideMessage: 'Предишна снимка',
          nextSlideMessage: 'Следваща снимка',
          paginationBulletMessage: 'Отиди към снимка {{index}}',
        }}
        onSwiper={setGallerySwiper}
        className="h-full w-full"
      >
        {gallerySlides.map((slide, index) => (
          <SwiperSlide key={slide.id} className="relative overflow-hidden">
            {slide.src ? (
              <>
                <img
                  src={slide.src}
                  alt={slide.caption}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent"
                  aria-hidden
                />
                <p
                  className={`pointer-events-none absolute left-3 right-3 max-w-[85%] text-sm font-medium tracking-tight text-white drop-shadow-md md:text-base ${galleryCaptionBottom}`}
                >
                  {slide.caption}
                </p>
              </>
            ) : (
              <div
                className={`relative flex h-full w-full items-center justify-center bg-linear-to-br ${PLACEHOLDER_GRADIENTS[index % PLACEHOLDER_GRADIENTS.length]}`}
              >
                <span className="text-8xl drop-shadow-sm" aria-hidden>
                  {'\u{1F9D8}'}
                </span>
                <p
                  className={`pointer-events-none absolute left-3 text-sm font-medium text-foreground/90 drop-shadow-sm md:text-base ${galleryCaptionBottom}`}
                >
                  {slide.caption}
                </p>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
