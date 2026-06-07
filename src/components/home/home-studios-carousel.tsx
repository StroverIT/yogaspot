'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState, type ReactNode } from 'react';

type CarouselProps = {
  fallback: ReactNode;
  prevClass: string;
  nextClass: string;
  bulletClass: string;
  bulletActiveClass: string;
  loop: boolean;
  autoplay?: boolean;
  slides: ReactNode[];
};

const HomeStudiosSwiper = dynamic(() => import('@/components/home/home-studios-swiper'), {
  ssr: false,
});

export function HomeStudiosCarousel({ fallback, slides, ...swiperProps }: CarouselProps) {
  const [showSwiper, setShowSwiper] = useState(false);

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  if (!showSwiper) {
    return <>{fallback}</>;
  }

  return <HomeStudiosSwiper {...swiperProps} slides={slides} />;
}
