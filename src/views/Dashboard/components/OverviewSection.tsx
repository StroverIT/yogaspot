import { Badge } from '@/components/ui/badge';
import type { Instructor, Studio, StudioSubscription, SubscriptionRequestDto, YogaClass } from '@/data/mock-data';
import type { DashboardRecentSignup } from '@/lib/dashboard-recent-signups';
import { formatPriceDualFromBgn } from '@/lib/eur-bgn';
import { calculateNetPayout, calculatePayoutFee, PAYOUT_MINIMUM_AMOUNT } from '@/lib/payments';
import { BarChart3, Calendar, MapPin, Star, TrendingUp, Users } from 'lucide-react';

import { dashboardCardClass, dashboardInsetClass } from '../dashboardUi';
import { DashboardOccupancyBar } from './DashboardOccupancyBar';
import { DashboardPageHeader } from './DashboardPageHeader';

export function OverviewSection({
  avgRating,
  totalEnrolled,
  totalCapacity,
  occupancyRate,
  myStudios,
  myClasses,
  myInstructors,
  revenue,
  subscriptions,
  subscriptionRequests,
  recentSignups,
}: {
  avgRating: string;
  totalEnrolled: number;
  totalCapacity: number;
  occupancyRate: number;
  myStudios: Studio[];
  myClasses: YogaClass[];
  myInstructors: Instructor[];
  revenue: number;
  subscriptions: StudioSubscription[];
  subscriptionRequests: SubscriptionRequestDto[];
  recentSignups: DashboardRecentSignup[];
}) {
  const classRevenue = myClasses.reduce((sum, cls) => sum + cls.enrolled * cls.price, 0);
  const subscriptionRevenue = subscriptions
    .filter((sub) => sub.hasMonthlySubscription)
    .reduce((sum, sub) => sum + (sub.monthlyPrice ?? 0), 0);
  const pendingSubscriptionRequests = subscriptionRequests.filter((req) => req.status === 'PENDING').length;
  const grossRevenue = classRevenue + subscriptionRevenue;
  const payoutFee = calculatePayoutFee(grossRevenue);
  const netPayout = calculateNetPayout(grossRevenue);
  const canRequestPayout = grossRevenue >= PAYOUT_MINIMUM_AMOUNT;
  const perStudioRevenue = myStudios.map((studio) => {
    const classesRevenueForStudio = myClasses
      .filter((cls) => cls.studioId === studio.id)
      .reduce((sum, cls) => sum + cls.enrolled * cls.price, 0);
    const monthlySubscriptionRevenue =
      subscriptions.find((sub) => sub.studioId === studio.id && sub.hasMonthlySubscription)?.monthlyPrice ?? 0;
    return {
      studioId: studio.id,
      studioName: studio.name,
      classesRevenueForStudio,
      monthlySubscriptionRevenue,
      total: classesRevenueForStudio + monthlySubscriptionRevenue,
    };
  });
  const salesHistory = [...myClasses]
    .sort((a, b) => `${b.date}T${b.startTime}`.localeCompare(`${a.date}T${a.startTime}`))
    .map((cls) => ({
      id: cls.id,
      name: cls.name,
      date: cls.date,
      gross: cls.enrolled * cls.price,
      enrolled: cls.enrolled,
    }));

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Преглед"
        description="Обобщена информация за вашия бизнес — рейтинг, записвания, класове и приход."
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            icon: TrendingUp,
            label: 'Среден рейтинг',
            value: avgRating,
            sub: `от ${myStudios.reduce((s, st) => s + st.reviewCount, 0)} ревюта`,
            iconWrap: 'bg-yoga-tertiary/35 text-primary',
          },
          {
            icon: Users,
            label: 'Общо записвания',
            value: totalEnrolled,
            sub: `от ${totalCapacity} места`,
            iconWrap: 'bg-secondary/20 text-secondary',
          },
          {
            icon: Calendar,
            label: 'Активни класове',
            value: myClasses.length,
            sub: `${myInstructors.length} инструктора`,
            iconWrap: 'bg-primary/12 text-primary',
          },
          {
            icon: BarChart3,
            label: 'Приход',
            value: formatPriceDualFromBgn(revenue),
            sub: 'от записвания',
            iconWrap: 'bg-muted text-yoga-secondary-deep',
          },
        ].map((card, i) => (
          <div key={i} className={`${dashboardCardClass} p-5`}>
            <div className="mb-4 flex items-start justify-between gap-2">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconWrap}`}
              >
                <card.icon className="h-5 w-5" aria-hidden />
              </span>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight text-foreground">{card.value}</p>
            <p className="mt-1 text-xs font-medium text-foreground/80">{card.label}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      <div className={`${dashboardCardClass} p-6`}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-foreground">Заетост на класовете</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {totalEnrolled} от {totalCapacity} места заети
            </p>
          </div>
          <span className="rounded-xl bg-primary/10 px-3 py-1.5 text-2xl font-bold tabular-nums text-primary">
            {occupancyRate}%
          </span>
        </div>
        <DashboardOccupancyBar
          percent={occupancyRate}
          heightClass="h-3"
          ariaLabel={`Обща заетост: ${totalEnrolled} от ${totalCapacity} места`}
          ariaValueNow={totalEnrolled}
          ariaValueMax={totalCapacity}
        />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          {myClasses.map(cls => {
            const fill = Math.round((cls.enrolled / cls.maxCapacity) * 100);
            const isFull = cls.enrolled >= cls.maxCapacity;
            return (
              <div key={cls.id} className={`${dashboardInsetClass} p-4`}>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="truncate pr-2 text-sm font-medium text-foreground">{cls.name}</p>
                  {isFull && (
                    <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">
                      Пълен
                    </Badge>
                  )}
                </div>
                <DashboardOccupancyBar
                  percent={fill}
                  className="mb-1.5"
                  ariaLabel={`${cls.name}: ${cls.enrolled} от ${cls.maxCapacity} места`}
                  ariaValueNow={cls.enrolled}
                  ariaValueMax={cls.maxCapacity}
                />
                <p className="text-xs text-muted-foreground">
                  {cls.enrolled}/{cls.maxCapacity} записани
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick actions */}
      <div className={`${dashboardCardClass} p-6`}>
        <h3 className="font-display mb-4 font-semibold text-foreground">Студиа</h3>
        <div className="space-y-3">
          {myStudios.map(studio => (
            <div
              key={studio.id}
              className={`flex items-center gap-4 p-4 ${dashboardInsetClass} transition-colors hover:bg-muted/30`}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-primary/25 via-secondary/15 to-yoga-tertiary/30 text-2xl">
                🧘
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-foreground">{studio.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0 text-secondary" />
                  {studio.address}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <div className="flex items-center justify-end gap-1">
                  <Star className="h-3.5 w-3.5 fill-yoga-tertiary text-primary" />
                  <span className="font-semibold text-foreground">{studio.rating}</span>
                </div>
                <p className="text-xs text-muted-foreground">{studio.reviewCount} ревюта</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {recentSignups.length > 0 ? (
        <div className={`${dashboardCardClass} p-6`}>
          <h3 className="font-display mb-2 font-semibold text-foreground">Последни записвания</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Платени през Stripe и офлайн записвания към вашите студиа — събития и разписание.
          </p>
          <div className="space-y-2">
            {recentSignups.map((row) => (
              <div
                key={row.id}
                className={`flex flex-col gap-1 rounded-xl border border-border/60 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${dashboardInsetClass}`}
              >
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{row.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.customerName} · {row.studioName}
                    {row.source === 'schedule' ? ' · разписание' : ''}
                    {row.paymentOrigin === 'offline' ? ' · без онлайн плащане' : ''}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {new Date(row.paidAt).toLocaleString('bg-BG')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className={`${dashboardCardClass} p-6`}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display font-semibold text-foreground">Финанси</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">Приходи, източници и теглене към банкова сметка</p>
          </div>
          <Badge variant={canRequestPayout ? 'default' : 'secondary'}>
            {canRequestPayout
              ? `Налични за теглене: ${formatPriceDualFromBgn(netPayout)}`
              : `Минимум за теглене: ${formatPriceDualFromBgn(PAYOUT_MINIMUM_AMOUNT)}`}
          </Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className={`${dashboardInsetClass} p-4`}>
            <p className="text-xs text-muted-foreground">Общ приход</p>
            <p className="mt-1 text-2xl font-bold text-foreground leading-tight">{formatPriceDualFromBgn(grossRevenue)}</p>
          </div>
          <div className={`${dashboardInsetClass} p-4`}>
            <p className="text-xs text-muted-foreground">Такса за теглене (4%)</p>
            <p className="mt-1 text-2xl font-bold text-foreground leading-tight">{formatPriceDualFromBgn(payoutFee)}</p>
          </div>
          <div className={`${dashboardInsetClass} p-4`}>
            <p className="text-xs text-muted-foreground">Нетно след такса</p>
            <p className="mt-1 text-2xl font-bold text-foreground leading-tight">{formatPriceDualFromBgn(netPayout)}</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className={`${dashboardInsetClass} p-4`}>
            <p className="mb-3 text-sm font-semibold text-foreground">Източници на приход</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Записвания</span>
                <span className="font-medium text-foreground">{formatPriceDualFromBgn(classRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Абонаменти</span>
                <span className="font-medium text-foreground">{formatPriceDualFromBgn(subscriptionRevenue)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Чакащи заявки</span>
                <span className="font-medium text-foreground">{pendingSubscriptionRequests}</span>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {perStudioRevenue.map((row) => (
                <div key={row.studioId} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2 text-muted-foreground">{row.studioName}</span>
                  <span className="font-medium text-foreground">{formatPriceDualFromBgn(row.total)}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`${dashboardInsetClass} p-4`}>
            <p className="mb-3 text-sm font-semibold text-foreground">История на последни продажби</p>
            <div className="space-y-2">
              {salesHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">Все още няма продажби.</p>
              ) : (
                salesHistory.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between gap-3 text-xs">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{sale.name}</p>
                      <p className="text-muted-foreground">{sale.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatPriceDualFromBgn(sale.gross)}</p>
                      <p className="text-muted-foreground">{sale.enrolled} записвания</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

