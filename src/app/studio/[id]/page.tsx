import { Suspense } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { StudioDetailPageSkeleton } from '@/components/studio-detail/studio-detail-page-skeleton';
import { getPublicStudioPayload } from '@/lib/get-public-studio';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { getSiteUrl } from '@/lib/site';
import { absoluteOgImageUrl, defaultShareOgImage, defaultShareTwitterImagePaths } from '@/lib/share-metadata';
import StudioDetail from '@/views/StudioDetail';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payload = await getPublicStudioPayload(id);

  if (!payload) {
    return {
      title: 'Студио не е намерено',
      robots: { index: false, follow: false },
    };
  }

  const { studio } = payload;
  const plainDesc = studio.description.replace(/\s+/g, ' ').trim();
  const snippet =
    plainDesc.length > 160 ? `${plainDesc.slice(0, 157)}…` : plainDesc;
  const ratingPart =
    studio.reviewCount > 0
      ? ` Рейтинг ${studio.rating.toFixed(1)} от ${studio.reviewCount} отзива.`
      : '';
  const description = `${snippet}${ratingPart}`;

  const images = (studio.images ?? []).filter(Boolean);
  const ogImage = images[0];
  const origin = getSiteUrl();
  const pageUrl = `${origin}/studio/${id}`;

  const ogImages = ogImage
    ? [{ url: absoluteOgImageUrl(ogImage, origin), alt: studio.name }, defaultShareOgImage]
    : [defaultShareOgImage];

  const twitterImages = ogImage
    ? [absoluteOgImageUrl(ogImage, origin)]
    : [...defaultShareTwitterImagePaths];

  return {
    title: studio.name,
    description,
    alternates: {
      canonical: `/studio/${id}`,
    },
    openGraph: {
      type: 'website',
      title: studio.name,
      description,
      url: pageUrl,
      images: ogImages,
    },
    twitter: {
      card: 'summary_large_image',
      title: studio.name,
      description,
      images: twitterImages,
    },
  };
}

export default async function StudioDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [payload, onlinePayments] = await Promise.all([
    getPublicStudioPayload(id, { trackView: true }),
    Promise.resolve(isOnlinePaymentsEnabled()),
  ]);

  if (!payload) {
    notFound();
  }

  return (
    <>
      <PageViewTracker event="studio_page_view" studioId={id} />
      <Suspense fallback={<StudioDetailPageSkeleton />}>
        <StudioDetail initialPayload={payload} onlinePayments={onlinePayments} />
      </Suspense>
    </>
  );
}
