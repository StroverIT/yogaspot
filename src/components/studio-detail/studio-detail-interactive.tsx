'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { Review, ScheduleEntry } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import type { TabKey } from '@/components/studio-detail/studio-detail-tabs/types';
import type { CheckoutModalTarget } from '@/components/studio-detail/booking-checkout-modal';
import type {
  PublicStudioCorePayload,
  PublicStudioExtras,
  PublicStudioPayload,
} from '@/lib/get-public-studio';
import { isClassAtCapacity } from '@/lib/yoga-class-limits';

const TAB_KEYS: TabKey[] = ['schedule', 'events', 'instructors', 'reviews'];

const StudioDetailTabs = dynamic(
  () =>
    import('@/components/studio-detail/studio-detail-tabs').then((m) => m.StudioDetailTabs),
  {
    loading: () => (
      <div className="mt-6 h-48 animate-pulse rounded-2xl border border-border bg-muted/40" />
    ),
  },
);

const BookingCheckoutModal = dynamic(
  () =>
    import('@/components/studio-detail/booking-checkout-modal').then((m) => m.BookingCheckoutModal),
  { ssr: false },
);

function tabFromSearchParam(tab: string | null): TabKey | undefined {
  if (tab && TAB_KEYS.includes(tab as TabKey)) return tab as TabKey;
  return undefined;
}

function tabNeedsExtras(tab: TabKey | undefined) {
  return tab === 'events' || tab === 'reviews';
}

type StudioDetailInteractiveProps = {
  initialPayload: PublicStudioCorePayload;
  onlinePayments: boolean;
};

export function StudioDetailInteractive({ initialPayload, onlinePayments }: StudioDetailInteractiveProps) {
  const searchParams = useSearchParams();
  const defaultTab = tabFromSearchParam(searchParams.get('tab'));
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);

  const [core, setCore] = useState(initialPayload);
  const [extras, setExtras] = useState<PublicStudioExtras | null>(null);
  const [extrasLoading, setExtrasLoading] = useState(false);
  const extrasRequested = useRef(false);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutModalTarget | null>(null);

  useEffect(() => {
    setCore(initialPayload);
  }, [initialPayload]);

  const loadExtras = useCallback(async () => {
    if (extrasRequested.current || extras) return;
    extrasRequested.current = true;
    setExtrasLoading(true);
    try {
      const res = await fetch(`/api/public/studios/${encodeURIComponent(core.studio.id)}/extras`);
      if (res.ok) {
        setExtras((await res.json()) as PublicStudioExtras);
      } else {
        extrasRequested.current = false;
      }
    } catch {
      extrasRequested.current = false;
    } finally {
      setExtrasLoading(false);
    }
  }, [core.studio.id, extras]);

  useEffect(() => {
    if (tabNeedsExtras(defaultTab)) {
      void loadExtras();
    }
  }, [defaultTab, loadExtras]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (tabNeedsExtras(tab)) {
        void loadExtras();
      }
    },
    [loadExtras],
  );

  const fetchFullPayload = useCallback(async (): Promise<PublicStudioPayload | null> => {
    const res = await fetch(`/api/public/studios/${encodeURIComponent(core.studio.id)}`);
    if (!res.ok) return null;
    return (await res.json()) as PublicStudioPayload;
  }, [core.studio.id]);

  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      void fetchFullPayload().then((data) => {
        if (!data) return;
        const { classes, reviews, ...nextCore } = data;
        setCore(nextCore);
        setExtras({ classes, reviews });
      });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, fetchFullPayload]);

  const handleReviewSubmitted = useCallback(() => {
    void fetchFullPayload().then((data) => {
      if (!data) return;
      const { classes, reviews, ...nextCore } = data;
      setCore(nextCore);
      setExtras({ classes, reviews });
    });
  }, [fetchFullPayload]);

  const { studio, instructors, schedule, subscription } = core;
  const studioClasses = extras?.classes ?? [];
  const studioReviews = (extras?.reviews ?? []).filter(
    (r: Review) => r.targetId === studio.id && r.targetType === 'studio',
  );
  const bookedClassIds = core.myBookings?.classIds ?? [];
  const bookedScheduleEntryIds = core.myBookings?.scheduleEntryIds ?? [];

  const handleRequestClassBook = (classId: string) => {
    if (!isAuthenticated) {
      toast.error('Моля, влезте в акаунта си, за да се запишете.');
      return;
    }
    if (bookedClassIds.includes(classId)) {
      return;
    }
    const cls = studioClasses.find((c) => c.id === classId);
    if (!cls) return;
    if (isClassAtCapacity(cls.enrolled, cls.maxCapacity)) {
      toast.info('Класът е пълен. Добавени сте в списъка на изчакване.');
      return;
    }
    setCheckoutTarget({ kind: 'class', studioId: studio.id, yogaClass: cls });
  };

  const handleRequestScheduleBook = (entry: ScheduleEntry) => {
    if (!isAuthenticated) {
      toast.error('Моля, влезте в акаунта си, за да се запишете.');
      return;
    }
    if (bookedScheduleEntryIds.includes(entry.id)) {
      return;
    }
    if (entry.studioId !== studio.id) return;
    if (isClassAtCapacity(entry.enrolled, entry.maxCapacity)) {
      toast.info('Този час е пълен.');
      return;
    }
    setCheckoutTarget({ kind: 'schedule', studioId: studio.id, entry });
  };

  return (
    <>
      {checkoutTarget !== null ? (
        <BookingCheckoutModal
          open
          target={checkoutTarget}
          onlinePayments={onlinePayments}
          onClose={() => setCheckoutTarget(null)}
          onBooked={() => {
            void fetchFullPayload().then((data) => {
              if (!data) return;
              const { classes, reviews, ...nextCore } = data;
              setCore(nextCore);
              setExtras({ classes, reviews });
            });
          }}
        />
      ) : null}

      <StudioDetailTabs
        key={studio.id}
        studioId={studio.id}
        studioTeachingMode={studio.teachingMode}
        studioOwnerUserId={studio.ownerUserId}
        studioSchedule={schedule}
        subscription={subscription ?? undefined}
        studioClasses={studioClasses}
        studioInstructors={instructors}
        studioReviews={studioReviews}
        eventsCount={core.eventsCount}
        reviewsCount={studio.reviewCount}
        extrasLoading={extrasLoading}
        onTabChange={handleTabChange}
        onBookClass={handleRequestClassBook}
        onRequestScheduleBook={handleRequestScheduleBook}
        onReviewSubmitted={handleReviewSubmitted}
        defaultTab={defaultTab}
        checkoutModalOpen={checkoutTarget !== null}
        bookedClassIds={bookedClassIds}
        bookedScheduleEntryIds={bookedScheduleEntryIds}
      />
    </>
  );
}
