'use client';

import Link from 'next/link';
import { CreditCard } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfileSubscriptions } from '@/hooks/useProfileSubscriptions';
import { formatSubscriptionDualFromBgn } from '@/lib/eur-bgn';
import { calculateFinalCustomerAmount } from '@/lib/payments';

function membershipStatusLabel(status: 'active' | 'past_due') {
  if (status === 'past_due') return 'Просрочено плащане';
  return 'Активен';
}

export default function ProfileSubscriptionsPage() {
  const { data, isPending, isError, error, refetch } = useProfileSubscriptions();
  const subscriptions = data?.subscriptions ?? [];

  if (isPending) {
    return (
      <div className="space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="text-sm font-medium text-destructive">Неуспешно зареждане на абонаментите.</p>
        <p className="mt-1 text-xs text-muted-foreground">{error?.message}</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
          Опитай отново
        </Button>
      </div>
    );
  }

  if (subscriptions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <h2 className="font-display text-lg font-semibold text-foreground">Нямате активни абонаменти</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Когато се абонирате за студио, то ще се появи тук.
        </p>
        <Button asChild className="mt-6 rounded-lg">
          <Link href="/discover">Разгледай студиа</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.map((sub) => (
        <article key={sub.id} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-foreground">{sub.studioName}</h2>
                <Badge variant={sub.status === 'past_due' ? 'destructive' : 'secondary'}>
                  {membershipStatusLabel(sub.status)}
                </Badge>
              </div>
              <p className="mt-1 text-sm font-medium text-foreground">{sub.subscriptionName}</p>
              {sub.includes ? (
                <p className="mt-2 text-sm text-muted-foreground">{sub.includes}</p>
              ) : null}
              <p className="mt-3 text-lg font-bold text-primary">
                {formatSubscriptionDualFromBgn(
                  calculateFinalCustomerAmount(sub.monthlyPrice),
                  sub.durationMonths,
                )}
              </p>
              {sub.currentPeriodEnd ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Следващо плащане:{' '}
                  {new Date(sub.currentPeriodEnd).toLocaleDateString('bg-BG', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              ) : null}
            </div>
            <Button asChild variant="outline" size="sm" className="shrink-0 rounded-lg">
              <Link href={`/studio/${sub.studioId}?tab=schedule`}>Към студиото</Link>
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}
