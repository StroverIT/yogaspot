'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { ScheduleEntry } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import type { TabKey } from '@/components/studio-detail/studio-detail-tabs/types';
import type { CheckoutModalTarget } from '@/components/studio-detail/booking-checkout-modal';
import type { PublicStudioPayload } from '@/lib/get-public-studio';

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

type StudioDetailInteractiveProps = {
  initialPayload: PublicStudioPayload;
  onlinePayments: boolean;
};

export function StudioDetailInteractive({ initialPayload, onlinePayments }: StudioDetailInteractiveProps) {
  const searchParams = useSearchParams();
  const defaultTab = tabFromSearchParam(searchParams.get('tab'));
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);

  const [payload, setPayload] = useState(initialPayload);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutModalTarget | null>(null);

  useEffect(() => {
    setPayload(initialPayload);
  }, [initialPayload]);

  const fetchStudioPayload = useCallback(async (): Promise<PublicStudioPayload | null> => {
    const studioId = payload.studio.id;
    const res = await fetch(`/api/public/studios/${encodeURIComponent(studioId)}`);
    if (!res.ok) return null;
    return (await res.json()) as PublicStudioPayload;
  }, [payload.studio.id]);

  useEffect(() => {
    if (!wasAuthenticated.current && isAuthenticated) {
      void fetchStudioPayload().then((data) => {
        if (data) setPayload(data);
      });
    }
    wasAuthenticated.current = isAuthenticated;
  }, [isAuthenticated, fetchStudioPayload]);

  const handleReviewSubmitted = useCallback(() => {
    void fetchStudioPayload().then((data) => {
      if (data) setPayload(data);
    });
  }, [fetchStudioPayload]);

  const { studio, instructors, classes, schedule, subscription, reviews } = payload;
  const studioReviews = reviews.filter((r) => r.targetId === studio.id && r.targetType === 'studio');
  const bookedClassIds = payload.myBookings?.classIds ?? [];
  const bookedScheduleEntryIds = payload.myBookings?.scheduleEntryIds ?? [];

  const handleRequestClassBook = (classId: string) => {
    if (!isAuthenticated) {
      toast.error('Моля, влезте в акаунта си, за да се запишете.');
      return;
    }
    if (bookedClassIds.includes(classId)) {
      return;
    }
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;
    if (cls.enrolled >= cls.maxCapacity) {
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
    if (entry.enrolled >= entry.maxCapacity) {
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
            void fetchStudioPayload().then((data) => {
              if (data) setPayload(data);
            });
          }}
        />
      ) : null}

      <StudioDetailTabs
        key={studio.id}
        studioId={studio.id}
        studioOwnerUserId={studio.ownerUserId}
        studioSchedule={schedule}
        subscription={subscription ?? undefined}
        studioClasses={classes}
        studioInstructors={instructors}
        studioReviews={studioReviews}
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
