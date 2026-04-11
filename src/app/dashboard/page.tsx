import { OverviewSection } from '@/views/Dashboard/components/OverviewSection';
import { getDashboardMockData } from '@/views/Dashboard/dashboardMockData';

export default function DashboardOverviewPage() {
  const {
    avgRating,
    totalEnrolled,
    totalCapacity,
    occupancyRate,
    myStudios,
    myClasses,
    myInstructors,
    revenue,
  } = getDashboardMockData();

  return (
    <OverviewSection
      avgRating={avgRating}
      totalEnrolled={totalEnrolled}
      totalCapacity={totalCapacity}
      occupancyRate={occupancyRate}
      myStudios={myStudios}
      myClasses={myClasses}
      myInstructors={myInstructors}
      revenue={revenue}
    />
  );
}
