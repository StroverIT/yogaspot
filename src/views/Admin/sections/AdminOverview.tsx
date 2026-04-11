'use client';

import Link from 'next/link';
import { Building2, Calendar, CreditCard, Star, Users } from 'lucide-react';
import { useMemo } from 'react';
import type { Review, Studio, SubscriptionRequestStatus, YogaClass } from '@/data/mock-data';
import type { AdminEnrollmentRow, AdminOverviewData, AdminSubscriptionRequestListItem } from '@/lib/admin-queries';
import { formatMonthlyDualFromBgn, formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateNetPayout, calculatePayoutFee } from '@/lib/payments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '../components/StatCard';

const LIST_LIMIT = 5;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function subscriptionStatusBadge(status: SubscriptionRequestStatus) {
  switch (status) {
    case 'PENDING':
      return <Badge variant="secondary">Изчаква</Badge>;
    case 'ACCEPTED':
      return <Badge className="bg-emerald-600 hover:bg-emerald-600/90">Одобрена</Badge>;
    case 'DECLINED':
      return <Badge variant="destructive">Отказана</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

export type AdminOverviewClientProps = AdminOverviewData;

export function AdminOverviewClient({
  studios,
  classes,
  reviews,
  enrollments,
  users,
  subscriptionRequests,
}: AdminOverviewClientProps) {
  const userCount = users.length;
  const totalEnrollments = classes.reduce((s, c) => s + c.enrolled, 0);

  const recentStudios = useMemo(
    () => [...studios].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, LIST_LIMIT),
    [studios],
  );
  const recentEnrollments = useMemo(
    () => [...enrollments].sort((a, b) => b.enrolledAt.localeCompare(a.enrolledAt)).slice(0, LIST_LIMIT),
    [enrollments],
  );
  const recentReviews = useMemo(
    () => [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, LIST_LIMIT),
    [reviews],
  );
  const recentSubscriptionRequests = useMemo(
    () => [...subscriptionRequests].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, LIST_LIMIT),
    [subscriptionRequests],
  );
  const classPriceByStudioAndName = useMemo(() => {
    const studioNameById = new Map(studios.map((studio) => [studio.id, studio.name]));
    const map = new Map<string, number>();
    classes.forEach((cls) => {
      const studioName = studioNameById.get(cls.studioId);
      if (!studioName) return;
      map.set(`${studioName}::${cls.name}`, cls.price);
    });
    return map;
  }, [classes, studios]);
  const userSpendRows = useMemo(() => {
    const rows = new Map<string, { userName: string; amount: number; count: number; lastDate: string; sources: Map<string, number> }>();
    enrollments.forEach((row) => {
      const amount = classPriceByStudioAndName.get(`${row.studioName}::${row.className}`) ?? 0;
      const existing = rows.get(row.userName) ?? {
        userName: row.userName,
        amount: 0,
        count: 0,
        lastDate: row.enrolledAt,
        sources: new Map<string, number>(),
      };
      existing.amount += amount;
      existing.count += 1;
      if (row.enrolledAt > existing.lastDate) existing.lastDate = row.enrolledAt;
      existing.sources.set(row.studioName, (existing.sources.get(row.studioName) ?? 0) + amount);
      rows.set(row.userName, existing);
    });
    return [...rows.values()]
      .sort((a, b) => b.amount - a.amount)
      .map((row) => ({
        ...row,
        sourceSummary: [...row.sources.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([studioName, amount]) => `${studioName}: ${formatPriceDualFromBgn(amount)}`)
          .join(' · '),
      }));
  }, [classPriceByStudioAndName, enrollments]);
  const businessRevenueRows = useMemo(() => {
    const ownerByStudioId = new Map(studios.map((studio) => [studio.id, { ownerUserId: studio.ownerUserId, studioName: studio.name }]));
    const usersById = new Map(users.map((user) => [user.id, user]));
    const rows = new Map<
      string,
      {
        ownerUserId: string;
        ownerName: string;
        ownerEmail: string;
        gross: number;
        classRevenue: number;
        subscriptionRevenue: number;
        sources: Map<string, number>;
      }
    >();

    classes.forEach((cls) => {
      const owner = ownerByStudioId.get(cls.studioId);
      if (!owner) return;
      const value = cls.enrolled * cls.price;
      const user = usersById.get(owner.ownerUserId);
      const existing = rows.get(owner.ownerUserId) ?? {
        ownerUserId: owner.ownerUserId,
        ownerName: user?.name ?? 'Без име',
        ownerEmail: user?.email ?? '',
        gross: 0,
        classRevenue: 0,
        subscriptionRevenue: 0,
        sources: new Map<string, number>(),
      };
      existing.gross += value;
      existing.classRevenue += value;
      existing.sources.set(owner.studioName, (existing.sources.get(owner.studioName) ?? 0) + value);
      rows.set(owner.ownerUserId, existing);
    });

    subscriptionRequests
      .filter((req) => req.status === 'ACCEPTED')
      .forEach((req) => {
        const owner = ownerByStudioId.get(req.studioId);
        if (!owner) return;
        const user = usersById.get(owner.ownerUserId);
        const existing = rows.get(owner.ownerUserId) ?? {
          ownerUserId: owner.ownerUserId,
          ownerName: user?.name ?? 'Без име',
          ownerEmail: user?.email ?? '',
          gross: 0,
          classRevenue: 0,
          subscriptionRevenue: 0,
          sources: new Map<string, number>(),
        };
        existing.gross += req.monthlyPrice;
        existing.subscriptionRevenue += req.monthlyPrice;
        existing.sources.set(`${owner.studioName} (абонаменти)`, (existing.sources.get(`${owner.studioName} (абонаменти)`) ?? 0) + req.monthlyPrice);
        rows.set(owner.ownerUserId, existing);
      });

    return [...rows.values()]
      .sort((a, b) => b.gross - a.gross)
      .map((row) => ({
        ...row,
        payoutFee: calculatePayoutFee(row.gross),
        payoutNet: calculateNetPayout(row.gross),
        sourceSummary: [...row.sources.entries()]
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([source, amount]) => `${source}: ${formatPriceDualFromBgn(amount)}`)
          .join(' · '),
      }));
  }, [classes, studios, subscriptionRequests, users]);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} label="Потребители" value={String(userCount)} trend="от базата" tint="primary" />
        <StatCard icon={<Building2 className="h-5 w-5 text-accent" />} label="Студиа" value={studios.length} trend="+2 нови" tint="accent" />
        <StatCard icon={<Calendar className="h-5 w-5 text-sage-foreground" />} label="Записвания" value={totalEnrollments} trend="+8% тази седмица" tint="sage" />
        <StatCard icon={<Star className="h-5 w-5 text-accent" />} label="Ревюта" value={reviews.length} tint="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последно създадени студиа</h3>
          <div className="space-y-3">
            {recentStudios.map((studio: Studio) => (
              <div key={studio.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-lg">🧘</div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm truncate">{studio.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{studio.address}</p>
                  <p className="text-[11px] text-muted-foreground/90 mt-0.5">Създадено {formatDate(studio.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                  <span className="text-sm font-semibold text-foreground">{studio.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последните 5 записвания</h3>
          <div className="space-y-3">
            {recentEnrollments.map((row: AdminEnrollmentRow) => (
              <div key={row.id} className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm">{row.userName}</span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap shrink-0">{formatDateTime(row.enrolledAt)}</span>
                </div>
                <p className="text-sm text-foreground/90">{row.className}</p>
                <p className="text-xs text-muted-foreground truncate">{row.studioName}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Последните 5 създадени ревюта</h3>
          <div className="space-y-3">
            {recentReviews.map((review: Review) => (
              <div key={review.id} className="p-3 rounded-xl bg-muted/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-medium text-foreground text-sm truncate">{review.userName}</span>
                  <span className="text-[11px] text-muted-foreground shrink-0">{formatDate(review.date)}</span>
                </div>
                <div className="flex mb-1">{Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}</div>
                <p className="text-sm text-muted-foreground line-clamp-2">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-white p-6 shadow-md">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Последни 5 заявки за абонамент</h3>
          <Button variant="outline" size="sm" className="rounded-xl shrink-0" asChild>
            <Link href="/admin/requests">Управление на заявки</Link>
          </Button>
        </div>
        {recentSubscriptionRequests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Няма заявки за абонамент.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recentSubscriptionRequests.map((req: AdminSubscriptionRequestListItem) => (
              <div key={req.id} className="flex gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-medium text-foreground text-sm truncate">{req.studioName}</span>
                    {subscriptionStatusBadge(req.status)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {req.ownerName || '—'}
                    {req.ownerEmail ? ` · ${req.ownerEmail}` : ''}
                  </p>
                  <p className="text-sm font-medium text-foreground mt-1 truncate">{req.name}</p>
                  <p className="text-xs text-primary font-semibold tabular-nums leading-snug">{formatMonthlyDualFromBgn(req.monthlyPrice)}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{req.includes}</p>
                  <p className="text-[11px] text-muted-foreground/90 mt-1.5">{formatDateTime(req.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Разходи по потребители</h3>
          {userSpendRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма данни за разходи на потребители.</p>
          ) : (
            <div className="space-y-3">
              {userSpendRows.map((row) => (
                <div key={row.userName} className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-foreground text-sm">{row.userName}</p>
                    <p className="text-sm font-semibold text-foreground leading-snug">{formatPriceDualFromBgn(row.amount)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{row.count} записвания · Последно плащане {formatDateTime(row.lastDate)}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{row.sourceSummary || 'Няма източник'}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-white p-6 shadow-md">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Приходи по бизнес акаунт</h3>
          {businessRevenueRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Няма данни за приходи на бизнес акаунти.</p>
          ) : (
            <div className="space-y-3">
              {businessRevenueRows.map((row) => (
                <div key={row.ownerUserId} className="rounded-xl bg-muted/50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{row.ownerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{row.ownerEmail || '—'}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground leading-snug">{formatPriceDualFromBgn(row.gross)}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Записвания: {formatPriceDualFromBgn(row.classRevenue)} · Абонаменти:{' '}
                    {formatPriceDualFromBgn(row.subscriptionRevenue)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    Такса теглене: {formatPriceDualFromBgn(row.payoutFee)} · Нетно: {formatPriceDualFromBgn(row.payoutNet)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{row.sourceSummary || 'Няма източник'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
