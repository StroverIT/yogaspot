import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { ArrowLeft } from 'lucide-react';

import { StudioDetailGallery } from '@/components/studio-detail/studio-detail-gallery';
import { StudioGalleryHero } from '@/components/studio-detail/studio-gallery-hero';
import { StudioDetailInteractive } from '@/components/studio-detail/studio-detail-interactive';
import { StudioDetailPageSkeleton } from '@/components/studio-detail/studio-detail-page-skeleton';
import { StudioDetailSidebar } from '@/components/studio-detail/studio-detail-sidebar';
import { StudioDetailMobileCta } from '@/components/studio-detail/studio-detail-mobile-cta';

const STUDIO_DETAIL_MOBILE_CTA_OFFSET_CLASS =
  'pb-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:pb-0';
import { StudioDetailSummary } from '@/components/studio-detail/studio-detail-summary';
import { getPublicStudioCorePayload } from '@/lib/get-public-studio';
export async function StudioDetailPageContent({ id }: { id: string }) {
  const payload = await getPublicStudioCorePayload(id, { trackView: true });

  if (!payload) {
    notFound();
  }

  const { studio } = payload;
  const showMultisport = payload.hasMultisport;

  return (
    <>
      <div className={`container mx-auto px-4 py-8 ${STUDIO_DETAIL_MOBILE_CTA_OFFSET_CLASS}`}>
        <Link
          href="/discover"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Обратно към търсене
        </Link>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
              <StudioGalleryHero images={studio.images} fill />
              <StudioDetailGallery images={studio.images} />
            </div>
            <StudioDetailSummary studio={studio} showMultisport={showMultisport} />
            <Suspense
              fallback={
                <div className="mt-6 h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
              }
            >
              <StudioDetailInteractive initialPayload={payload} />
            </Suspense>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <StudioDetailSidebar studio={studio} />
          </div>
        </div>
      </div>
      <StudioDetailMobileCta studio={studio} />
    </>
  );
}

export function StudioDetailPageContentFallback() {
  return <StudioDetailPageSkeleton />;
}
