'use client';

import { useEffect, useState } from 'react';
import type { Instructor, Review, ScheduleEntry, StudioSubscription, YogaClass } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { EventsTabContent } from './events-tab-content';
import { InstructorsTabContent } from './instructors-tab-content';
import { ReviewsTabContent } from './reviews-tab-content';
import { ScheduleContent } from '@/components/schedule/schedule-content';
import { StudioDetailTabBar } from './studio-detail-tab-bar';
import type { TabKey } from './types';

export function StudioDetailTabs({
  studioId,
  studioOwnerUserId,
  studioSchedule,
  subscription,
  studioClasses,
  studioInstructors,
  studioReviews,
  onBookClass,
  onRequestScheduleBook,
  onReviewSubmitted,
  defaultTab,
  checkoutModalOpen,
}: {
  studioId: string;
  studioOwnerUserId: string;
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  studioClasses: YogaClass[];
  studioInstructors: Instructor[];
  studioReviews: Review[];
  onBookClass: (classId: string) => void;
  onRequestScheduleBook: (entry: ScheduleEntry) => void;
  onReviewSubmitted: () => void;
  defaultTab?: TabKey;
  checkoutModalOpen: boolean;
}) {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>(defaultTab ?? 'schedule');

  useEffect(() => {
    if (defaultTab) setActiveTab(defaultTab);
  }, [defaultTab]);

  const tabs = [
    { key: 'schedule' as const, label: 'Разписание', count: studioSchedule.length },
    { key: 'events' as const, label: 'Събития', count: studioClasses.length },
    { key: 'instructors' as const, label: 'Инструктори', count: studioInstructors.length },
    { key: 'reviews' as const, label: 'Ревюта', count: studioReviews.length },
  ];

  return (
    <>
      <StudioDetailTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="mt-6">
        {activeTab === 'schedule' && (
          <ScheduleContent
            variant="user"
            studioSchedule={studioSchedule}
            subscription={subscription}
            instructors={studioInstructors}
            isAuthenticated={isAuthenticated}
            checkoutModalOpen={checkoutModalOpen}
            onRequestScheduleBook={onRequestScheduleBook}
          />
        )}
        {activeTab === 'events' && (
          <EventsTabContent
            studioClasses={studioClasses}
            instructors={studioInstructors}
            checkoutModalOpen={checkoutModalOpen}
            onBookClass={onBookClass}
          />
        )}
        {activeTab === 'instructors' && (
          <InstructorsTabContent studioInstructors={studioInstructors} />
        )}
        {activeTab === 'reviews' && (
          <ReviewsTabContent
            studioId={studioId}
            studioOwnerUserId={studioOwnerUserId}
            studioReviews={studioReviews}
            onReviewSubmitted={onReviewSubmitted}
          />
        )}
      </div>
    </>
  );
}
