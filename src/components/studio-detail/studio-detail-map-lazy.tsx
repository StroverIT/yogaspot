'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import type { Studio } from '@/data/mock-data';
import { useDeferredLoad } from '@/hooks/use-deferred-load';

const StudioDetailMap = dynamic(
  () => import('@/components/studio-detail/studio-detail-map').then((m) => m.StudioDetailMap),
  { ssr: false },
);

function hasStudioCoords(studio: Studio) {
  const { lat, lng } = studio;
  if (lat == null || lng == null) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

export function StudioDetailMapLazy({ studio }: { studio: Studio }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldLoad = useDeferredLoad(containerRef, { idleTimeout: 6000, rootMargin: '120px' });
  const coords = hasStudioCoords(studio);

  return (
    <div ref={containerRef} className="h-full min-h-[200px]">
      {shouldLoad ? (
        <StudioDetailMap studio={studio} />
      ) : (
        <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 p-4 text-center text-sm text-muted-foreground">
          <span className="text-2xl opacity-60" aria-hidden>
            {'\u{1F4CD}'}
          </span>
          {coords ? (
            <span>Картата се зарежда на заден план…</span>
          ) : (
            <span>Локацията на картата още не е зададена за това студио.</span>
          )}
        </div>
      )}
    </div>
  );
}
