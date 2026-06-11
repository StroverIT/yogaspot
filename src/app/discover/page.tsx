import { Suspense } from 'react';
import type { Metadata } from 'next';

import { DiscoverAsideMenu } from '@/components/discover/DiscoverAsideMenu';
import { getDiscoverCitiesCached } from '@/lib/get-discover-catalog';
import { defaultShareOgImages, defaultShareTwitterImagePaths } from '@/lib/share-metadata';
import { DiscoverMainContent } from '@/components/discover/discover-main-content';
import { DiscoverPageAsideColumn } from '@/components/discover/discover-page-aside-column';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Открий студио',
  description:
    'Намери най-доброто йога студио близо до теб. Филтрирай по ниво, тип йога и рейтинг.',
  alternates: {
    canonical: '/discover',
  },
  openGraph: {
    type: 'website',
    title: 'Открий студио',
    description:
      'Намери най-доброто йога студио близо до теб. Филтрирай по ниво, тип йога и рейтинг.',
    url: '/discover',
    images: defaultShareOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Открий студио',
    description:
      'Намери най-доброто йога студио близо до теб. Филтрирай по ниво, тип йога и рейтинг.',
    images: [...defaultShareTwitterImagePaths],
  },
};

function DiscoverFiltersSkeleton() {
  return (
    <aside className="hidden w-72 flex-shrink-0 lg:block">
      <div className="sticky top-24 space-y-4 rounded-xl border border-yoga-accent-soft bg-yoga-surface p-6">
        <Skeleton className="h-6 w-24 bg-yoga-accent-soft/40" />
        <Skeleton className="h-10 w-full bg-yoga-accent-soft/30" />
        <Skeleton className="h-10 w-full bg-yoga-accent-soft/30" />
        <Skeleton className="h-24 w-full bg-yoga-accent-soft/20" />
      </div>
    </aside>
  );
}

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DiscoverPage({ searchParams }: PageProps) {
  const cities = await getDiscoverCitiesCached();

  return (
    <div className="flex min-h-screen flex-col bg-yoga-bg">
      <PageViewTracker event="discover_page_view" />
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-semibold text-yoga-text md:text-4xl">
            Открий студио
          </h1>
          <p className="mt-2 text-yoga-text-soft">
            Разгледай всички йога студиа и намери това, което е идеално за теб
          </p>
        </div>

        <div className="flex gap-8">
          <Suspense fallback={<DiscoverFiltersSkeleton />}>
            <DiscoverPageAsideColumn cities={cities} />
          </Suspense>

          <div className="min-w-0 flex-1">
            <Suspense fallback={null}>
              <DiscoverAsideMenu variant="mobile-toolbar" cities={cities} />
            </Suspense>

            <DiscoverMainContent searchParams={searchParams} />
          </div>
        </div>
      </main>
    </div>
  );
}
