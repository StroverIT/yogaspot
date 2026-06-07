import type { Metadata } from 'next';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getBusinessOffer } from '@/lib/business-platform-billing';
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
  const offer = await getBusinessOffer();

  return (
    <>
      <PageViewTracker event="studio_offer_page_view" />
      <StudioOfferPage offer={offer} />
    </>
  );
}
