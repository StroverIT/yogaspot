"use client";

import { Suspense } from "react";
import { DiscoverPageContent } from "@/components/discover/discover-page-content";
import { Spinner } from "@/components/ui/spinner";

const Discover = () => {
  return (
    <div className="min-h-screen flex flex-col bg-yoga-bg">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-yoga-text font-semibold">
            Открий студио
          </h1>
          <p className="mt-2 text-yoga-text-soft">
            Разгледай всички йога студиа и намери това, което е идеално за теб
          </p>
        </div>

        <Suspense
          fallback={
            <div className="flex justify-center py-16">
              <Spinner className="w-8 h-8 text-yoga-accent" />
            </div>
          }
        >
          <DiscoverPageContent />
        </Suspense>
      </main>
    </div>
  );
};

export default Discover;
