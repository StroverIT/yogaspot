'use client';

import { useEffect, useState } from 'react';
import type { Instructor, Review, ScheduleEntry, StudioSubscription, TeachingMode, YogaClass } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { EventsTabContent } from './events-tab-content';
import { InstructorsTabContent } from './instructors-tab-content';
import { ReviewsTabContent } from './reviews-tab-content';
import { ScheduleContent } from '@/components/schedule/schedule-content';
import { StudioDetailVideosTab } from '@/components/studio-detail/studio-detail-videos-tab';
import { StudioDetailTabBar } from './studio-detail-tab-bar';
import type { TabKey } from './types';
import type { AccessibleSubscriptionVideo } from '@/lib/subscription-videos-access';

export function StudioDetailTabs({
  studioId,
  studioTeachingMode,
  studioOwnerUserId,
  studioSchedule,
  subscription,
  studioClasses,
  studioInstructors,
  studioReviews,
  eventsCount,
  subscriptionVideosCount,
  studioVideos,
  videosLoading,
  reviewsCount,
  extrasLoading,
  onTabChange,
  onBookClass,
  onRequestScheduleBook,
  onReviewSubmitted,
  defaultTab,
  checkoutModalOpen,
  bookedClassIds,
  bookedScheduleEntryIds,
  hasActiveMembership,
}: {
  studioId: string;
  studioTeachingMode: TeachingMode;
  studioOwnerUserId: string;
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  studioClasses: YogaClass[];
  studioInstructors: Instructor[];
  studioReviews: Review[];
  eventsCount: number;
  subscriptionVideosCount: number;
  studioVideos: AccessibleSubscriptionVideo[];
  videosLoading: boolean;
  reviewsCount: number;
  extrasLoading: boolean;
  onTabChange: (tab: TabKey) => void;
  onBookClass: (classId: string) => void;
  onRequestScheduleBook: (entry: ScheduleEntry) => void;
  onReviewSubmitted: () => void;
  defaultTab?: TabKey;
  checkoutModalOpen: boolean;
  bookedClassIds: string[];
  bookedScheduleEntryIds: string[];
  hasActiveMembership: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab ?? 'schedule');

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    onTabChange(tab);
  };

  const tabs = [
    { key: 'schedule' as const, label: 'Разписание', count: studioSchedule.length },
    ...(subscriptionVideosCount > 0
      ? [{ key: 'videos' as const, label: 'Видеа', count: subscriptionVideosCount }]
      : []),
    { key: 'events' as const, label: 'Събития', count: eventsCount },
    { key: 'instructors' as const, label: 'Инструктори', count: studioInstructors.length },
    { key: 'reviews' as const, label: 'Ревюта', count: reviewsCount },
  ];

  return (
    <>
      <StudioDetailTabBar tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="mt-6">
        {activeTab === 'schedule' && (
          <ScheduleContent
            variant="user"
            studioId={studioId}
            studioSchedule={studioSchedule}
            subscription={subscription}
            instructors={studioInstructors}
            isAuthenticated={isAuthenticated}
            hasActiveMembership={hasActiveMembership}
            checkoutModalOpen={checkoutModalOpen}
            onRequestScheduleBook={onRequestScheduleBook}
            bookedScheduleEntryIds={bookedScheduleEntryIds}
            studioTeachingMode={studioTeachingMode}
          />
        )}
        {activeTab === 'videos' && (
          <StudioDetailVideosTab
            studioId={studioId}
            videos={studioVideos}
            hasActiveMembership={hasActiveMembership}
            loading={videosLoading}
          />
        )}
        {activeTab === 'events' &&
          (extrasLoading ? (
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
          ) : (
            <EventsTabContent
              studioTeachingMode={studioTeachingMode}
              studioClasses={studioClasses}
              instructors={studioInstructors}
              checkoutModalOpen={checkoutModalOpen}
              onBookClass={onBookClass}
              isAuthenticated={isAuthenticated}
              bookedClassIds={bookedClassIds}
            />
          ))}
        {activeTab === 'instructors' && (
          <InstructorsTabContent studioInstructors={studioInstructors} />
        )}
        {activeTab === 'reviews' &&
          (extrasLoading ? (
            <div className="h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
          ) : (
            <ReviewsTabContent
              studioId={studioId}
              studioOwnerUserId={studioOwnerUserId}
              studioReviews={studioReviews}
              onReviewSubmitted={onReviewSubmitted}
            />
          ))}
      </div>
    </>
  );
}
