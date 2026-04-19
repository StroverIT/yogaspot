'use client';

import ImageGallerySwiper from '@/components/gallery/ImageGallerySwiper';

export default function RetreatImageSwiper({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  return <ImageGallerySwiper images={images} title={title} />;
}
