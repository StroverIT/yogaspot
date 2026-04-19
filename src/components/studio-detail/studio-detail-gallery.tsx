import ImageGallerySwiper from '@/components/gallery/ImageGallerySwiper';

export function StudioDetailGallery({ images }: { images: string[] }) {
  return <ImageGallerySwiper images={images} title="Студио" />;
}
