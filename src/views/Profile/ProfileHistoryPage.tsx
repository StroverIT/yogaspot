'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ProfileHistoryTab } from '@/components/profile/profile-history-tab';
import { ProfileClassDetailDialog } from '@/components/profile/profile-class-detail-dialog';
import { formatMonthlyDualFromBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';
import { useProfileHistory } from '@/hooks/useProfileHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

type SpendingRow = {
  id: string;
  date: string;
  reason: string;
  studioName: string;
  baseAmount: number;
  finalPaid: number;
};

export default function ProfileHistoryPage() {
  const searchParams = useSearchParams();
  const { data, isPending, isError, error, refetch } = useProfileHistory();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('checkout') !== 'success') return;
    void refetch();
    const path = window.location.pathname;
    window.history.replaceState({}, '', path);
  }, [searchParams, refetch]);

  const selected = useMemo(() => {
    if (!selectedClass || !data) return null;
    return data.classes.find((c) => c.id === selectedClass) ?? null;
  }, [data, selectedClass]);

  const selectedInstructor = useMemo(() => {
    if (!selected) return undefined;
    return data?.instructors.find((i) => i.id === selected.instructorId);
  }, [data?.instructors, selected]);

  const selectedStudio = useMemo(() => {
    if (!selected) return undefined;
    return data?.studios.find((s) => s.id === selected.studioId);
  }, [data?.studios, selected]);

  const attendedDate = useMemo(() => {
    if (!selectedClass || !data) return null;
    return data.attendedClasses.find((a) => a.classId === selectedClass)?.attendedDate ?? null;
  }, [data, selectedClass]);

  const spendingHistory = useMemo((): SpendingRow[] => {
    if (!data) return [];
    const classById = new Map(data.classes.map((c) => [c.id, c]));
    const studioById = new Map(data.studios.map((s) => [s.id, s]));
    return data.attendedClasses
      .map((attended) => {
        const cls = classById.get(attended.classId);
        if (!cls) return null;
        const studio = studioById.get(cls.studioId);
        const finalPaid = calculateFinalCustomerAmount(cls.price);
        return {
          id: attended.classId + attended.attendedDate,
          date: attended.attendedDate,
          reason: `Клас: ${cls.name}`,
          studioName: studio?.name ?? 'Неизвестно студио',
          baseAmount: cls.price,
          finalPaid,
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a!.date > b!.date ? -1 : 1)) as SpendingRow[];
  }, [data]);

  const totalSpent = spendingHistory.reduce((sum, row) => sum + row.finalPaid, 0);
  const activeSubscriptions = data?.activeSubscriptions ?? [];
  const attendedClasses = data?.attendedClasses ?? [];
  const confirmedReservations = data?.confirmedReservations ?? [];
  const totalClasses = attendedClasses.length;

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-full max-w-sm" />
              <Skeleton className="h-10 w-48 mt-4" />
              <Skeleton className="h-12 w-full rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          ))}
        </div>
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm text-destructive font-medium">Неуспешно зареждане на историята.</p>
        <p className="text-xs text-muted-foreground mt-1">{error?.message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          Опитай отново
        </Button>
      </div>
    );
  }

  return (
    <>
      {confirmedReservations.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">Потвърдени резервации</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Онлайн плащания през Stripe и записвания без онлайн такса — събития и разписание.
          </p>
          <ul className="mt-4 space-y-2">
            {confirmedReservations.map((row) => (
              <li
                key={row.id}
                className="flex flex-col gap-1 rounded-lg bg-muted/40 px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.studioName} · {row.subtitle}
                    {row.source === 'schedule' ? ' · разписание' : ''}
                  </p>
                </div>
                <div className="shrink-0 text-right text-xs sm:text-sm">
                  {row.paymentOrigin === 'offline' ? (
                    <p className="font-medium text-foreground leading-snug">Записване (без онлайн плащане)</p>
                  ) : (
                    <p className="font-semibold text-foreground leading-snug">
                      {formatPriceDualFromBgn(row.amountMinor / 100)}
                    </p>
                  )}
                  <p className="text-muted-foreground">
                    {new Date(row.bookedAt).toLocaleString('bg-BG')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">Моите разходи</h3>
          <p className="mt-1 text-sm text-muted-foreground">Всичко платено по посещения, с включени онлайн такси.</p>
          <p className="mt-4 text-3xl font-bold text-foreground leading-tight">{formatPriceDualFromBgn(totalSpent)}</p>
          <div className="mt-4 space-y-2">
            {spendingHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Няма плащания.</p>
            ) : (
              spendingHistory.slice(0, 6).map((row) => (
                <div key={row.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{row.reason}</p>
                    <p className="truncate text-muted-foreground">
                      {row.studioName} · {row.date}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground leading-snug">{formatPriceDualFromBgn(row.finalPaid)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">Моите абонаменти</h3>
          <p className="mt-1 text-sm text-muted-foreground">Месечни планове при любими студиа с активен абонамент.</p>
          <div className="mt-4 space-y-2">
            {activeSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нямате любими студиа с активен месечен план.</p>
            ) : (
              activeSubscriptions.map((sub) => (
                <div key={sub.studioId} className="rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{sub.studioName}</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">
                      {formatMonthlyDualFromBgn(sub.monthlyPrice)}
                    </p>
                  </div>
                  {sub.note ? <p className="mt-1 text-xs text-muted-foreground">{sub.note}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <ProfileHistoryTab
        attendedClasses={attendedClasses}
        totalClasses={totalClasses}
        classes={data.classes}
        instructors={data.instructors}
        studios={data.studios}
        onSelectClass={setSelectedClass}
      />

      <ProfileClassDetailDialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        selected={selected}
        selectedInstructor={selectedInstructor}
        selectedStudio={selectedStudio}
        attendedDate={attendedDate}
      />
    </>
  );
}
