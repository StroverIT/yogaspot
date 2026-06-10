'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ProfileHistoryTab } from '@/components/profile/profile-history-tab';
import { ProfileClassDetailDialog } from '@/components/profile/profile-class-detail-dialog';
import { bgnFromStripeEurTotalMinor, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { useProfileHistory } from '@/hooks/useProfileHistory';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import type { AttendedClass } from '@/components/profile/profile-mock-data';

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

  const { attendedDate, bookedDate } = useMemo(() => {
    if (!selectedClass || !data) {
      return { attendedDate: null as string | null, bookedDate: null as string | null };
    }
    const att = data.attendedClasses.find((a) => a.classId === selectedClass);
    if (att) return { attendedDate: att.attendedDate, bookedDate: null };
    const booking = data.confirmedReservations.find(
      (r) => r.source === 'class' && r.yogaClassId === selectedClass,
    );
    return {
      attendedDate: null,
      bookedDate: booking ? booking.bookedAt.slice(0, 10) : null,
    };
  }, [data, selectedClass]);

  /** Attendances plus booked yoga events that are not yet marked as attended. */
  const eventRowsForTab = useMemo((): AttendedClass[] => {
    if (!data) return [];
    const attendedByClassId = new Map(data.attendedClasses.map((a) => [a.classId, a]));
    const fromBookingsOnly: AttendedClass[] = [];
    for (const row of data.confirmedReservations) {
      if (row.source !== 'class' || !row.yogaClassId) continue;
      if (attendedByClassId.has(row.yogaClassId)) continue;
      const cls = data.classes.find((c) => c.id === row.yogaClassId);
      fromBookingsOnly.push({
        classId: row.yogaClassId,
        attendedDate: cls?.date ?? row.bookedAt.slice(0, 10),
      });
    }
    const combined = [...data.attendedClasses, ...fromBookingsOnly];
    combined.sort((a, b) => (a.attendedDate < b.attendedDate ? 1 : -1));
    return combined;
  }, [data]);

  const spendingHistory = useMemo((): SpendingRow[] => {
    if (!data) return [];
    return data.confirmedReservations
      .map((row) => {
        const finalPaid =
          row.paymentOrigin === 'offline'
            ? row.priceBgn
            : row.amountMinor > 0 && (row.currency === 'eur' || !row.currency)
              ? bgnFromStripeEurTotalMinor(row.amountMinor)
              : row.priceBgn;
        return {
          id: row.id,
          date: row.bookedAt.slice(0, 10),
          reason: row.source === 'schedule' ? `Разписание: ${row.title}` : `Клас: ${row.title}`,
          studioName: row.studioName,
          baseAmount: row.priceBgn,
          finalPaid,
        };
      })
      .sort((a, b) => (a.date > b.date ? -1 : 1));
  }, [data]);

  const totalSpent = spendingHistory.reduce((sum, row) => sum + row.finalPaid, 0);
  const confirmedReservations = data?.confirmedReservations ?? [];
  const totalEventRows = data ? eventRowsForTab.length : 0;

  if (isPending) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-48 mt-4" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-12 w-full rounded-lg" />
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
            Онлайн плащания през Stripe и записвания без онлайн такса - събития и разписание.
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
                  <p className="font-semibold text-foreground leading-snug">
                    {formatPriceDualFromBgn(
                      row.paymentOrigin === 'offline'
                        ? row.priceBgn
                        : row.amountMinor > 0 && (row.currency === 'eur' || !row.currency)
                          ? bgnFromStripeEurTotalMinor(row.amountMinor)
                          : row.priceBgn,
                    )}
                  </p>

                  <p className="text-muted-foreground">
                    {new Date(row.bookedAt).toLocaleString('bg-BG')}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mb-6 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold text-foreground">Моите разходи</h3>
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
      <ProfileHistoryTab
        attendedClasses={eventRowsForTab}
        totalClasses={totalEventRows}
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
        bookedDate={bookedDate}
      />
    </>
  );
}
