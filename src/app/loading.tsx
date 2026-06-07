import {
  HomeHeroSectionSkeleton,
  HomeStudiosSectionsSkeleton,
} from '@/components/home/home-section-skeletons';

export default function HomeLoading() {
  return (
    <div className="font-body">
      <HomeHeroSectionSkeleton />
      <HomeStudiosSectionsSkeleton />
    </div>
  );
}
