'use client';

import dynamic from 'next/dynamic';
import type { Studio } from '@/data/mock-data';

const StudioDetailMapLazy = dynamic(
  () =>
    import('@/components/studio-detail/studio-detail-map-lazy').then((m) => m.StudioDetailMapLazy),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Картата се зарежда на заден план…
      </div>
    ),
  },
);

export function StudioDetailMapSection({ studio }: { studio: Studio }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Локация</h3>
      <div className="aspect-square overflow-hidden rounded-xl border border-border bg-muted/20">
        <StudioDetailMapLazy studio={studio} />
      </div>
    </div>
  );
}
