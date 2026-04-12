'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import type { Instructor, Review, ScheduleEntry, Studio, StudioSubscription, YogaClass } from '@/data/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { StudioNotFound } from '@/components/studio-detail/studio-not-found';
import { StudioDetailGallery } from '@/components/studio-detail/studio-detail-gallery';
import { StudioDetailSummary } from '@/components/studio-detail/studio-detail-summary';
import { StudioDetailTabs } from '@/components/studio-detail/studio-detail-tabs';
import type { TabKey } from '@/components/studio-detail/studio-detail-tabs/types';
import { StudioDetailSidebar } from '@/components/studio-detail/studio-detail-sidebar';
import { StudioDetailPageSkeleton } from '@/components/studio-detail/studio-detail-page-skeleton';
import { BookingCheckoutModal, type CheckoutModalTarget } from '@/components/studio-detail/booking-checkout-modal';

const TAB_KEYS: TabKey[] = ['schedule', 'events', 'instructors', 'reviews'];

function tabFromSearchParam(tab: string | null): TabKey | undefined {
  if (tab && TAB_KEYS.includes(tab as TabKey)) return tab as TabKey;
  return undefined;
}

type StudioPayload = {
  studio: Studio;
  instructors: Instructor[];
  classes: YogaClass[];
  schedule: ScheduleEntry[];
  subscription: StudioSubscription | null;
  reviews: Review[];
};

const StudioDetail = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string | undefined;
  const defaultTab = tabFromSearchParam(searchParams.get('tab'));
  const { isAuthenticated } = useAuth();

  const [payload, setPayload] = useState<StudioPayload | null>(undefined);
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutModalTarget | null>(null);
  const [onlinePayments, setOnlinePayments] = useState(true);

  const fetchStudioPayload = useCallback(async (): Promise<StudioPayload | null> => {
    if (!id) return null;
    const res = await fetch(`/api/public/studios/${encodeURIComponent(id)}`);
    if (!res.ok) return null;
    return (await res.json()) as StudioPayload;
  }, [id]);

  useEffect(() => {
    void fetch('/api/public/payment-settings')
      .then((r) => r.json())
      .then((d: { onlinePayments?: boolean }) => {
        if (typeof d.onlinePayments === 'boolean') setOnlinePayments(d.onlinePayments);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!id) {
      setPayload(null);
      return;
    }
    let cancelled = false;
    setPayload(undefined);
    void fetchStudioPayload()
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch(() => {
        if (!cancelled) setPayload(null);
      });
    return () => {
      cancelled = true;
    };
  }, [id, fetchStudioPayload]);

  const handleReviewSubmitted = useCallback(() => {
    void fetchStudioPayload().then((data) => setPayload(data));
  }, [fetchStudioPayload]);

  if (payload === undefined) {
    return <StudioDetailPageSkeleton />;
  }

  if (!payload?.studio) {
    return <StudioNotFound />;
  }

  const { studio, instructors, classes, schedule, subscription, reviews } = payload;
  const studioReviews = reviews.filter((r) => r.targetId === studio.id && r.targetType === 'studio');

  const handleRequestClassBook = (classId: string) => {
    if (!isAuthenticated) {
      toast.error('Моля, влезте в акаунта си, за да се запишете.');
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
    if (entry.studioId !== studio.id) return;
    if (entry.enrolled >= entry.maxCapacity) {
      toast.info('Този час е пълен.');
      return;
    }
    setCheckoutTarget({ kind: 'schedule', studioId: studio.id, entry });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <BookingCheckoutModal
        open={checkoutTarget !== null}
        target={checkoutTarget}
        onlinePayments={onlinePayments}
        onClose={() => setCheckoutTarget(null)}
        onBooked={() => {
          void fetchStudioPayload().then((data) => {
            if (data) setPayload(data);
          });
        }}
      />
      <Link
        href="/discover"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Обратно към търсене
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StudioDetailGallery images={studio.images} />
          <StudioDetailSummary studio={studio} />
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
          />
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <StudioDetailSidebar studio={studio} />
        </div>
      </div>
    </div>
  );
};

export default StudioDetail;
