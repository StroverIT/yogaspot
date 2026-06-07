'use client';

import dynamic from 'next/dynamic';
import type { Studio } from '@/data/mock-data';
import { StudioDetailFavoriteButton } from '@/components/studio-detail/studio-detail-favorite-button';
import { StudioDetailSidebarInfo } from '@/components/studio-detail/studio-detail-sidebar-info';

const StudioDetailMapSection = dynamic(
  () =>
    import('@/components/studio-detail/studio-detail-map-section').then((m) => m.StudioDetailMapSection),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-border bg-card p-6">
        <h3 className="mb-3 font-display text-lg font-semibold text-foreground">Локация</h3>
        <div className="flex aspect-square items-center justify-center rounded-xl border border-border bg-muted/20 text-sm text-muted-foreground">
          Картата се зарежда на заден план…
        </div>
      </div>
    ),
  },
);

export function StudioDetailSidebar({ studio }: { studio: Studio }) {
  return (
    <aside className="space-y-6">
      <StudioDetailSidebarInfo studio={studio} />
      <StudioDetailMapSection studio={studio} />
      <StudioDetailFavoriteButton studioId={studio.id} />
    </aside>
  );
}
