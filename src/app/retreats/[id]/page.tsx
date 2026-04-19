import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { PageViewTracker } from '@/components/analytics/PageViewTracker';
import { getHomeRetreatById } from '@/lib/home/home-data';
import RetreatDetail from '@/views/RetreatDetail';

export const dynamic = 'force-dynamic';

type RetreatDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RetreatDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const retreat = await getHomeRetreatById(id);
  if (!retreat) {
    return { title: 'Рийтрийт' };
  }
  return {
    title: `${retreat.title} | Рийтрийт`,
    description: retreat.description,
  };
}

export default async function RetreatDetailPage({ params }: RetreatDetailPageProps) {
  const { id } = await params;
  const retreat = await getHomeRetreatById(id);
  if (!retreat) notFound();

  return (
    <div className="min-h-screen bg-yoga-bg">
      <PageViewTracker event="studio_page_view" />
      <RetreatDetail retreat={retreat} />
    </div>
  );
}
