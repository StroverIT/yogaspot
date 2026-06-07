import type { Metadata } from 'next';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getBusinessOffer } from '@/lib/business-platform-billing';
import { getHomeStudios, getHomeClasses } from '@/lib/home/home-data';
import { StudioOfferPage } from '@/views/StudioOfferPage/StudioOfferPage';

export const metadata: Metadata = {
  title: 'Zenno за йога студиа',
  description:
    'Управлявайте йога студиото си в Zenno — разписание, записвания и откриваемост без собствен сайт или рекламен бюджет.',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
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
