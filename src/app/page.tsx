import { Suspense } from "react";
import HomeHeroSectionServer from "@/components/home/home-hero-section-server";
import HowItWorksSection from "@/views/HomePage/HowItWorksSection";
import HomeNearbyStudiosSectionServer from "@/components/home/home-nearby-studios-section-server";
import HomeTopStudiosSectionServer from "@/components/home/home-top-studios-section-server";
import ForStudiosCTA from "@/views/HomePage/ForStudiosCTA";
import { HomeStudiosFavoriteShell } from "@/components/home/home-studios-favorite-shell";
import {
  HomeHeroSectionSkeleton,
  HomeNearbyStudiosSectionSkeleton,
  HomeTopStudiosSectionSkeleton,
} from "@/components/home/home-section-skeletons";

export default function HomePage() {
  return (
    <div className="font-body">
      <Suspense fallback={<HomeHeroSectionSkeleton />}>
        <HomeHeroSectionServer />
      </Suspense>

      <HowItWorksSection />

      <HomeStudiosFavoriteShell>
        <Suspense fallback={<HomeNearbyStudiosSectionSkeleton />}>
          <HomeNearbyStudiosSectionServer />
        </Suspense>

        <Suspense fallback={<HomeTopStudiosSectionSkeleton />}>
          <HomeTopStudiosSectionServer />
        </Suspense>
      </HomeStudiosFavoriteShell>

      <ForStudiosCTA />
    </div>
  );
}
