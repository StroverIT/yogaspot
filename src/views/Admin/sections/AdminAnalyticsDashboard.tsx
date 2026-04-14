import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { AdminAnalyticsPayload } from '@/lib/admin-analytics';
import { BookingsLineChart } from '@/views/Admin/components/analytics/BookingsLineChart';
import { FunnelBarChart } from '@/views/Admin/components/analytics/FunnelBarChart';

type AdminAnalyticsDashboardProps = {
  analytics: AdminAnalyticsPayload;
};

function percent(value: number): string {
  return `${value.toFixed(2)}%`;
}

function MetricLabel({ label, tooltip }: { label: string; tooltip: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="cursor-help underline decoration-dotted underline-offset-4">{label}</span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs leading-relaxed">{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function AdminAnalyticsDashboard({ analytics }: AdminAnalyticsDashboardProps) {
  const funnel = [
    { step: 'Signup', count: analytics.userFunnel.signupCompleted },
    { step: 'Search', count: analytics.userFunnel.searchPerformed },
    { step: 'Booking Started', count: analytics.userFunnel.bookingStarted },
    { step: 'Booking Completed', count: analytics.userFunnel.bookingCompleted },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Total Users" tooltip="Общ брой всички регистрирани потребители в платформата." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{analytics.overview.totalUsers}</CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Total Bookings" tooltip="Общ брой завършени записвания (класове и разписание)." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{analytics.overview.totalBookings}</CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Conversion Rate" tooltip="Процент записвания спрямо общия брой потребители." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{percent(analytics.overview.conversionRate)}</CardContent>
        </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Business Accounts" tooltip="Брой потребители с роля бизнес акаунт." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{analytics.businessOnboarding.totalBusinessAccounts}</CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Onboarding Completed" tooltip="Брой бизнес акаунти, които са създали поне едно студио." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{analytics.businessOnboarding.completedOnboarding}</CardContent>
        </Card>
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <MetricLabel label="Business Completion Rate" tooltip="Процент бизнес акаунти, които са завършили онбординга (създадено студио)." />
            </CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">{percent(analytics.businessOnboarding.completionRate)}</CardContent>
        </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <MetricLabel
                  label="Signups This Month"
                  tooltip="Регистрации за текущия месец, разделени по клиентски и бизнес акаунти."
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Client Signups" tooltip="Брой нови клиентски регистрации за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signups.client}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Business Signups" tooltip="Брой нови бизнес регистрации за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signups.business}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Total Signups" tooltip="Общ брой всички регистрации за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signups.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/80 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                <MetricLabel
                  label="Sign-ins This Month"
                  tooltip="Входове в системата за текущия месец, разделени по клиентски и бизнес акаунти."
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Client Sign-ins" tooltip="Брой успешни входове на клиентски акаунти за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signins.client}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Business Sign-ins" tooltip="Брой успешни входове на бизнес акаунти за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signins.business}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel label="Total Sign-ins" tooltip="Общ брой всички успешни входове за текущия месец." />
                </span>
                <span className="font-semibold">{analytics.monthlyAuth.signins.total}</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">User Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {funnel.map((step) => (
              <div key={step.step} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  <MetricLabel
                    label={step.step}
                    tooltip={
                      step.step === 'Signup'
                        ? 'Брой потребители, които са завършили регистрация.'
                        : step.step === 'Search'
                          ? 'Брой потребители, които са направили търсене в каталога.'
                          : step.step === 'Booking Started'
                            ? 'Брой стартирани процеси за записване.'
                            : 'Брой успешно завършени записвания.'
                    }
                  />
                </span>
                <span className="font-semibold">{step.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/80 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Studio Health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                <MetricLabel label="Total Studios" tooltip="Общ брой създадени студиа в платформата." />
              </span>
              <span className="font-semibold">{analytics.studioActivation.totalStudios}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                <MetricLabel label="With Profile Completed" tooltip="Процент студиа с отбелязано завършване на профила." />
              </span>
              <span className="font-semibold">{percent(analytics.studioActivation.profileCompletionRate)}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
              <span className="text-sm text-muted-foreground">
                <MetricLabel label="With Classes" tooltip="Процент студиа, които имат поне един създаден клас." />
              </span>
              <span className="font-semibold">{percent(analytics.studioActivation.classActivationRate)}</span>
            </div>
          </CardContent>
        </Card>
        </section>

        <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BookingsLineChart data={analytics.timeSeries.map((d) => ({ date: d.date, bookings: d.bookings, signups: d.signups, total: d.bookings + d.signups }))} />
        <FunnelBarChart data={funnel} />
        </section>

        {analytics.topPerformingStudios.length > 0 ? (
          <section>
            <Card className="rounded-2xl border-border/80 shadow-sm">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  <MetricLabel
                    label="Top Performing Studios"
                    tooltip="Студиа с най-много завършени записвания за избрания период."
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {analytics.topPerformingStudios.map((studio) => (
                  <div key={studio.studioId} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{studio.studioId}</span>
                    <span className="font-semibold">{studio.bookings} bookings</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
