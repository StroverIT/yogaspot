import type { Metadata } from 'next';
import { Suspense } from 'react';

import HomeHeroSectionServer from '@/components/home/home-hero-section-server';
import HomeStudiosSectionsServer from '@/components/home/home-studios-sections-server';
import {
  HomeHeroSectionSkeleton,
  HomeStudiosSectionsSkeleton,
} from '@/components/home/home-section-skeletons';
import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { HomeStudiosFavoriteShell } from '@/components/home/home-studios-favorite-shell';
import { defaultSiteDescription } from '@/lib/site';
import { defaultShareOgImages, defaultShareTwitterImagePaths } from '@/lib/share-metadata';
import ForStudiosCTA from '@/views/HomePage/ForStudiosCTA';
import HowItWorksSection from '@/views/HomePage/HowItWorksSection';

export const metadata: Metadata = {
  title: {
    absolute: 'Йога студиа, класове и онлайн записване',
  },
  description: defaultSiteDescription,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    title: 'Йога студиа, класове и онлайн записване',
    description: defaultSiteDescription,
    images: defaultShareOgImages,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Йога студиа, класове и онлайн записване',
    description: defaultSiteDescription,
    images: [...defaultShareTwitterImagePaths],
  },
};

export default function HomePage() {
  return (
    <div className="font-body">
      <PageViewTracker event="home_page_view" />
      <Suspense fallback={<HomeHeroSectionSkeleton />}>
        <HomeHeroSectionServer />
      </Suspense>

      <HowItWorksSection />

      <HomeStudiosFavoriteShell>
        <Suspense fallback={<HomeStudiosSectionsSkeleton />}>
          <HomeStudiosSectionsServer />
        </Suspense>
      </HomeStudiosFavoriteShell>

      <ForStudiosCTA />
    </div>
  );
}
