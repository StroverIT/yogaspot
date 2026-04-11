import type { Metadata } from "next";
import { Suspense } from "react";
import { DiscoverCatalogGridSection } from "@/components/discover/discover-catalog-grid-section";
import { DiscoverAsideMenu } from "@/components/discover/DiscoverAsideMenu";
import { DiscoverPageAsideColumn } from "@/components/discover/discover-page-aside-column";
import { DiscoverGridSkeleton } from "@/components/discover/discover-grid-skeleton";

export const metadata: Metadata = {
  title: "Открий студио | Zenno",
  description:
    "Намери най-доброто йога студио близо до теб. Филтрирай по ниво, тип йога и рейтинг.",
};

export default function DiscoverPage() {
  return (
    <div className="flex min-h-screen flex-col bg-yoga-bg">
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
          <DiscoverPageAsideColumn />

          <div className="min-w-0 flex-1">
            <DiscoverAsideMenu variant="mobile-toolbar" />

            <Suspense fallback={<DiscoverGridSkeleton />}>
              <DiscoverCatalogGridSection />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}
