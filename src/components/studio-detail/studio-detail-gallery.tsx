'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ImageGallerySwiper = dynamic(() => import('@/components/gallery/ImageGallerySwiper'), {
  ssr: false,
});

export function StudioDetailGallery({ images }: { images: string[] }) {
  const [showSwiper, setShowSwiper] = useState(false);

  useEffect(() => {
    setShowSwiper(true);
  }, []);

  if (!showSwiper) {
    return null;
  }

  return (
    <div className="absolute inset-0">
      <ImageGallerySwiper images={images} title="Студио" />
    </div>
  );
}
