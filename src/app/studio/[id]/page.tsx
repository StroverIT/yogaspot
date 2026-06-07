import { Suspense } from 'react';
import type { Metadata } from 'next';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import {
  StudioDetailPageContent,
  StudioDetailPageContentFallback,
} from '@/components/studio-detail/studio-detail-page-content';
import { getPublicStudioCorePayload } from '@/lib/get-public-studio';
import { getSiteUrl } from '@/lib/site';
import { absoluteOgImageUrl, defaultShareOgImage, defaultShareTwitterImagePaths } from '@/lib/share-metadata';

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const payload = await getPublicStudioCorePayload(id);

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

  return (
    <>
      <PageViewTracker event="studio_page_view" studioId={id} />
      <Suspense fallback={<StudioDetailPageContentFallback />}>
        <StudioDetailPageContent id={id} />
      </Suspense>
    </>
  );
}
