'use client';

import { useState } from 'react';
import { mockStudios, mockClasses, mockInstructors, mockSubscriptions } from '@/data/mock-data';
import { ProfileHistoryTab } from '@/components/profile/profile-history-tab';
import { ProfileClassDetailDialog } from '@/components/profile/profile-class-detail-dialog';
import { mockAttendedClasses } from '@/components/profile/profile-mock-data';
import { formatMonthlyDualFromBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';

export default function ProfileHistoryPage() {
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showEmptyHistory, setShowEmptyHistory] = useState(false);

  const selected = selectedClass ? mockClasses.find((c) => c.id === selectedClass) ?? null : null;
  const selectedInstructor = selected ? mockInstructors.find((i) => i.id === selected.instructorId) : undefined;
  const selectedStudio = selected ? mockStudios.find((s) => s.id === selected.studioId) : undefined;
  const attendedDate = selectedClass
    ? mockAttendedClasses.find((a) => a.classId === selectedClass)?.attendedDate
    : null;

  const attendedClasses = showEmptyHistory ? [] : mockAttendedClasses;
  const totalClasses = attendedClasses.length;
  const spendingHistory = attendedClasses
    .map((attended) => {
      const cls = mockClasses.find((c) => c.id === attended.classId);
      if (!cls) return null;
      const studio = mockStudios.find((s) => s.id === cls.studioId);
      const finalPaid = calculateFinalCustomerAmount(cls.price);
      return {
        id: attended.classId,
        date: attended.attendedDate,
        reason: `Клас: ${cls.name}`,
        studioName: studio?.name ?? 'Неизвестно студио',
        baseAmount: cls.price,
        finalPaid,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a!.date > b!.date ? -1 : 1)) as {
    id: string;
    date: string;
    reason: string;
    studioName: string;
    baseAmount: number;
    finalPaid: number;
  }[];
  const totalSpent = spendingHistory.reduce((sum, row) => sum + row.finalPaid, 0);
  const activeSubscriptions = mockSubscriptions
    .filter((sub) => sub.hasMonthlySubscription)
    .map((sub) => {
      const studio = mockStudios.find((s) => s.id === sub.studioId);
      return {
        studioId: sub.studioId,
        studioName: studio?.name ?? 'Неизвестно студио',
        monthlyPrice: sub.monthlyPrice ?? 0,
        note: sub.subscriptionNote ?? '',
      };
    });

  return (
    <>
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
                    <p className="truncate text-muted-foreground">{row.studioName} · {row.date}</p>
                  </div>
                  <p className="font-semibold text-foreground leading-snug">{formatPriceDualFromBgn(row.finalPaid)}</p>
                </div>
              ))
            )}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="font-display text-lg font-semibold text-foreground">Моите абонаменти</h3>
          <p className="mt-1 text-sm text-muted-foreground">Активни месечни планове и какво включват.</p>
          <div className="mt-4 space-y-2">
            {activeSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Нямате активни абонаменти.</p>
            ) : (
              activeSubscriptions.map((sub) => (
                <div key={sub.studioId} className="rounded-lg bg-muted/40 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{sub.studioName}</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">{formatMonthlyDualFromBgn(sub.monthlyPrice)}</p>
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
        showEmptyHistory={showEmptyHistory}
        onToggleEmptyHistory={() => setShowEmptyHistory(!showEmptyHistory)}
        onSelectClass={setSelectedClass}
      />

      <ProfileClassDetailDialog
        open={!!selectedClass}
        onOpenChange={(open) => !open && setSelectedClass(null)}
        selected={selected}
        selectedInstructor={selectedInstructor}
        selectedStudio={selectedStudio}
        attendedDate={attendedDate}
      />
    </>
  );
}
