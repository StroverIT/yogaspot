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
  studioSchedule,
  subscription,
  studioClasses,
  studioInstructors,
  studioReviews,
  onBookClass,
  defaultTab,
}: {
  studioSchedule: ScheduleEntry[];
  subscription: StudioSubscription | undefined;
  studioClasses: YogaClass[];
  studioInstructors: Instructor[];
  studioReviews: Review[];
  onBookClass: (classId: string) => void;
  defaultTab?: TabKey;
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
          />
        )}
        {activeTab === 'events' && (
          <EventsTabContent studioClasses={studioClasses} onBookClass={onBookClass} />
        )}
        {activeTab === 'instructors' && (
          <InstructorsTabContent studioInstructors={studioInstructors} />
        )}
        {activeTab === 'reviews' && <ReviewsTabContent studioReviews={studioReviews} />}
      </div>
    </>
  );
}
