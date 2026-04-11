import { Suspense } from 'react';

import DashboardStudiosSection from './dashboard-studios-section';
import { DashboardStudiosSectionSkeleton } from './studios-section-skeleton';

export default function DashboardStudiosPage() {
  return (
    <Suspense fallback={<DashboardStudiosSectionSkeleton />}>
      <DashboardStudiosSection />
    </Suspense>
  );
}
