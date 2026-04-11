"use client";

import { useEffect, useRef } from "react";
import { DiscoverStudioCard } from "@/components/discover/discover-studio-card";
import { Spinner } from "@/components/ui/spinner";
import type { DiscoverStudio } from "@/types/studio-discovery";

interface DiscoverGridProps {
  studios: DiscoverStudio[];
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function DiscoverGrid({ studios, isLoading, hasMore, onLoadMore }: DiscoverGridProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoading, onLoadMore]);

  if (studios.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-yoga-accent-soft rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-yoga-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="font-serif text-xl text-yoga-text mb-2">Няма намерени студиа</h3>
        <p className="text-yoga-text-soft">Опитай да промениш филтрите или търсенето</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {studios.map((studio, index) => (
          <DiscoverStudioCard key={studio.id} studio={studio} priority={index < 6} />
        ))}
      </div>

      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {isLoading && (
          <div className="flex items-center gap-2 text-yoga-text-soft">
            <Spinner className="w-5 h-5" />
            <span>Зареждане на още студиа...</span>
          </div>
        )}
        {!hasMore && studios.length > 0 && (
          <p className="text-yoga-text-soft">Това са всички студиа</p>
        )}
      </div>
    </div>
  );
}
