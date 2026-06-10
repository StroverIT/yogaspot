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
import { StudioMembershipBanner } from '@/components/studio-detail/studio-membership-banner';
import type { AccessibleSubscriptionVideo } from '@/lib/subscription-videos-access';
import { isClassAtCapacity } from '@/lib/yoga-class-limits';

const TAB_KEYS: TabKey[] = ['schedule', 'videos', 'events', 'instructors', 'reviews'];

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

function tabNeedsVideos(tab: TabKey | undefined) {
  return tab === 'videos';
}

type StudioDetailInteractiveProps = {
  initialPayload: PublicStudioCorePayload;
};

export function StudioDetailInteractive({ initialPayload }: StudioDetailInteractiveProps) {
  const searchParams = useSearchParams();
  const defaultTab = tabFromSearchParam(searchParams.get('tab'));
  const { isAuthenticated } = useAuth();
  const wasAuthenticated = useRef(isAuthenticated);
  const handledSubscriptionReturn = useRef(false);

  const [core, setCore] = useState(initialPayload);
  const [extras, setExtras] = useState<PublicStudioExtras | null>(null);
  const [extrasLoading, setExtrasLoading] = useState(false);
  const extrasRequested = useRef(false);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutModalTarget | null>(null);
  const [studioVideos, setStudioVideos] = useState<AccessibleSubscriptionVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const videosRequested = useRef(false);

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

  const loadVideos = useCallback(
    async (force = false) => {
      if (!force && videosRequested.current) return;
      videosRequested.current = true;
      setVideosLoading(true);
      try {
        const res = await fetch(`/api/public/studios/${encodeURIComponent(core.studio.id)}/videos`);
        if (res.ok) {
          const data = (await res.json()) as { videos?: AccessibleSubscriptionVideo[] };
          setStudioVideos(data.videos ?? []);
        } else {
          videosRequested.current = false;
        }
      } catch {
        videosRequested.current = false;
      } finally {
        setVideosLoading(false);
      }
    },
    [core.studio.id],
  );

  useEffect(() => {
    if (tabNeedsExtras(defaultTab)) {
      void loadExtras();
    }
    if (tabNeedsVideos(defaultTab)) {
      void loadVideos();
    }
  }, [defaultTab, loadExtras, loadVideos]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      if (tabNeedsExtras(tab)) {
        void loadExtras();
      }
      if (tabNeedsVideos(tab)) {
        void loadVideos();
      }
    },
    [loadExtras, loadVideos],
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
  const hasActiveMembership = core.myBookings?.hasActiveMembership ?? false;

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7719/ingest/4ef9124f-801d-4bd7-a1fe-597ca17d2e31',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'a2d8e4'},body:JSON.stringify({sessionId:'a2d8e4',location:'studio-detail-interactive.tsx:myBookings',message:'studio page booking state',data:{studioId:studio.id,bookedClassIds,bookedScheduleEntryIds,eventsCount:studioClasses.length},timestamp:Date.now(),hypothesisId:'C'})}).catch(()=>{});
    // #endregion
  }, [studio.id, bookedClassIds, bookedScheduleEntryIds, studioClasses.length]);

  useEffect(() => {
    const subscriptionParam = searchParams.get('subscription');
    const sessionId = searchParams.get('session_id');
    if (subscriptionParam !== 'success' || handledSubscriptionReturn.current) return;
    handledSubscriptionReturn.current = true;
    toast.success('Абонаментът е активиран успешно.');
    window.history.replaceState({}, '', `/studio/${encodeURIComponent(studio.id)}?tab=schedule`);
    void (async () => {
      if (sessionId) {
        await fetch('/api/checkout/studio-subscription/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, studioId: studio.id }),
        });
      }
      const data = await fetchFullPayload();
      if (!data) return;
      const { classes, reviews, ...nextCore } = data;
      setCore(nextCore);
      setExtras({ classes, reviews });
      videosRequested.current = false;
      void loadVideos(true);
    })();
  }, [searchParams, studio.id, fetchFullPayload, loadVideos]);

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

      {hasActiveMembership ? (
        <StudioMembershipBanner
          studioId={studio.id}
          hasVideos={core.subscriptionVideosCount > 0}
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
        subscriptionVideosCount={core.subscriptionVideosCount}
        studioVideos={studioVideos}
        videosLoading={videosLoading}
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
        hasActiveMembership={hasActiveMembership}
      />
    </>
  );
}
