import type { Metadata } from 'next';

import { GoogleTagPageViewTracker } from '@/components/analytics/GoogleTagPageViewTracker';
import { MetaPixelPageViewTracker } from '@/components/analytics/MetaPixelPageViewTracker';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getBusinessOffer } from '@/lib/business-platform-billing';
import { getHomeStudios, getHomeClasses } from '@/lib/home/home-data';
import { defaultShareOgImages, defaultShareTwitterImagePaths } from '@/lib/share-metadata';
import { StudioOfferPage } from '@/views/StudioOfferPage/StudioOfferPage';

const title = 'Zenno за йога студиа';
const description =
  'Управлявайте йога студиото си в Zenno - разписание, записвания и откриваемост без собствен сайт или рекламен бюджет.';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: '/studio-offer',
  },
  openGraph: {
    type: 'website',
    url: '/studio-offer',
    title,
    description,
    images: defaultShareOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [...defaultShareTwitterImagePaths],
  },
};

export default async function StudioOfferRoutePage() {
  const [offer, studios, classes] = await Promise.all([
    getBusinessOffer(),
    getHomeStudios(),
    getHomeClasses(),
  ]);

  const totalReviews = studios.reduce((s, st) => s + st.reviewCount, 0);
  const avgRating =
    totalReviews > 0
      ? (studios.reduce((acc, st) => acc + st.rating * st.reviewCount, 0) / totalReviews).toFixed(1)
      : studios.length > 0
        ? (studios.reduce((acc, st) => acc + st.rating, 0) / studios.length).toFixed(1)
        : '0';
  const totalEnrolled = classes.reduce((s, c) => s + c.enrolled, 0);

  return (
    <>
      <PageViewTracker event="studio_offer_page_view" />
      <MetaPixelPageViewTracker contentName="studio_offer" />
      <GoogleTagPageViewTracker contentName="studio_offer" />
      <StudioOfferPage
        offer={offer}
        stats={{
          studioCount: studios.length,
          classCount: classes.length,
          totalEnrolled,
          avgRating,
        }}
      />
    </>
  );
}
