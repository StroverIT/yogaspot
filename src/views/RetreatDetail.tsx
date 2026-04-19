import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@/components/ui/button';
import RetreatImageSwiper from '@/components/retreats/RetreatImageSwiper';
import { RetreatDetailSummary } from '@/components/retreat-detail/retreat-detail-summary';
import { RetreatDetailContent } from '@/components/retreat-detail/retreat-detail-content';
import { RetreatDetailSidebar } from '@/components/retreat-detail/retreat-detail-sidebar';
import type { HomeRetreat } from '@/lib/home/home-data';

export default function RetreatDetail({ retreat }: { retreat: HomeRetreat }) {
  return (
    <main className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" className="mb-6 -ml-2">
        <Link href="/retreats">
          <ArrowLeft className="mr-2 h-4 w-4" /> Назад към рийтрийти
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <RetreatImageSwiper images={retreat.images} title={retreat.title} />
          <RetreatDetailSummary retreat={retreat} />
          <RetreatDetailContent retreat={retreat} />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <RetreatDetailSidebar retreat={retreat} />
        </div>
      </div>
    </main>
  );
}
