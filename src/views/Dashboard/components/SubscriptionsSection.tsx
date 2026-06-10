'use client';

import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { isStripeConnectReady, type StripeConnectSummary } from '@/lib/stripe-connect';
import type { Studio, StudioSubscription } from '@/data/mock-data';
import { formatSubscriptionDualFromBgn } from '@/lib/eur-bgn';
import { CreditCard, Edit, Plus, Trash2 } from 'lucide-react';

import { dashboardCardClass } from '../dashboardUi';
import { DashboardPageHeader } from './DashboardPageHeader';
import { SubscriptionModal, type SubscriptionModalPayload } from './modals/SubscriptionModal';

function canManageSubscriptions(stripeConnect: StripeConnectSummary | null | undefined): boolean {
  return isStripeConnectReady(stripeConnect);
}

export function SubscriptionsSection({
  studios,
  subscriptions,
  stripeConnect,
  onWorkspaceReload,
}: {
  studios: Studio[];
  subscriptions: StudioSubscription[];
  stripeConnect: StripeConnectSummary | null | undefined;
  onWorkspaceReload: () => void | Promise<void>;
}) {
  const [selectedStudio, setSelectedStudio] = useState(studios[0]?.id ?? '');
  const [modalOpen, setModalOpen] = useState(false);
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const selectedStudioName = studios.find(s => s.id === selectedStudio)?.name ?? '';
  const subscription = useMemo(
    () => subscriptions.find(s => s.studioId === selectedStudio),
    [subscriptions, selectedStudio],
  );
  const stripeReady = canManageSubscriptions(stripeConnect);

  const startStripeConnect = async () => {
    setConnectLoading(true);
    try {
      const res = await fetch('/api/dashboard/stripe-connect/onboard', { method: 'POST' });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      toast.error(typeof j.error === 'string' ? j.error : 'Неуспешно стартиране на Stripe свързване.');
    } finally {
      setConnectLoading(false);
    }
  };

  const handleSave = async (payload: SubscriptionModalPayload) => {
    const res = await fetch(`/api/dashboard/subscriptions/${selectedStudio}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const j = (await res.json().catch(() => ({}))) as { error?: string; code?: string };
    if (!res.ok) {
      if (j.code === 'stripe_not_connected') {
        toast.error(j.error ?? 'Свържете Stripe акаунта си.');
      } else {
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      }
      return;
    }
    toast.success(subscription?.hasMonthlySubscription ? 'Абонаментът е обновен.' : 'Абонаментът е създаден.');
    setModalOpen(false);
    await onWorkspaceReload();
  };

  const confirmDeactivate = async () => {
    const res = await fetch(`/api/dashboard/subscriptions/${selectedStudio}`, { method: 'DELETE' });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно деактивиране (${res.status})`);
      return;
    }
    toast.success('Абонаментът е деактивиран.');
    setDeactivateOpen(false);
    await onWorkspaceReload();
  };

  if (studios.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Абонаменти"
          description="Създайте абонаментни планове за вашите студиа."
        />
        <div className={`${dashboardCardClass} p-8 text-center text-muted-foreground`}>
          Първо добавете студио, за да конфигурирате абонамент.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Абонаменти"
        description="Управлявайте абонаментните планове за вашите студиа — цена, продължителност и какво включват."
        actions={
          stripeReady ? (
            <Button
              type="button"
              onClick={() => setModalOpen(true)}
              className="gap-2 shadow-sm shadow-primary/20"
            >
              <Plus className="h-4 w-4" />
              {subscription?.hasMonthlySubscription ? 'Редактирай' : 'Създай абонамент'}
            </Button>
          ) : null
        }
      />

      <Select value={selectedStudio} onValueChange={setSelectedStudio}>
        <SelectTrigger className="w-full rounded-xl border-border/80 bg-card sm:w-[250px]">
          <SelectValue placeholder="Изберете студио" />
        </SelectTrigger>
        <SelectContent>
          {studios.map(s => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {!stripeReady ? (
        <div className={`${dashboardCardClass} p-6`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-secondary/15 p-2.5 ring-1 ring-secondary/25 shrink-0">
                <CreditCard className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Свържете Stripe акаунт</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Работим със Stripe. За да приемате онлайн плащания, нужно е да свържете акаунта със Stripe.
                </p>
                {stripeConnect?.accountId && !stripeConnect.isReady ? (
                  <p className="mt-2 text-xs text-amber-600">
                    Акаунтът е свързан, но още не е готов за плащания. Довършете настройката в Stripe.
                  </p>
                ) : null}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 gap-2 rounded-xl"
              disabled={connectLoading}
              onClick={() => void startStripeConnect()}
            >
              <CreditCard className="h-4 w-4" />
              {connectLoading ? 'Зареждане…' : stripeConnect?.accountId ? 'Свържи отново' : 'Свържи със Stripe'}
            </Button>
          </div>
        </div>
      ) : subscription?.hasMonthlySubscription ? (
        <div className={`${dashboardCardClass} p-5`}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3 min-w-0">
              <div className="rounded-xl bg-secondary/15 p-2.5 ring-1 ring-secondary/25 shrink-0">
                <CreditCard className="h-5 w-5 text-secondary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-foreground">
                  {subscription.name ?? 'Абонамент'}
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {subscription.includes ?? subscription.subscriptionNote}
                </p>
                <p className="mt-1 text-lg font-bold tabular-nums text-primary">
                  {formatSubscriptionDualFromBgn(
                    subscription.monthlyPrice ?? 0,
                    subscription.durationMonths ?? 1,
                  )}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl"
                onClick={() => setModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
                Редактирай
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2 rounded-xl text-destructive hover:text-destructive"
                onClick={() => setDeactivateOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Деактивирай
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`${dashboardCardClass} p-8 text-center`}>
          <CreditCard className="mx-auto h-10 w-10 text-muted-foreground/50" />
          <p className="mt-3 font-medium text-foreground">Няма активен абонамент</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Създайте план с цена, продължителност и описание на включените услуги.
          </p>
          <Button type="button" className="mt-4 gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Създай абонамент
          </Button>
        </div>
      )}

      <SubscriptionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        studioName={selectedStudioName}
        subscription={subscription?.hasMonthlySubscription ? subscription : null}
      />

      <AlertDialog open={deactivateOpen} onOpenChange={setDeactivateOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Деактивиране на абонамент</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да деактивирате абонамента за{' '}
              <span className="font-medium text-foreground">{selectedStudioName}</span>? Той вече няма да се
              показва публично.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отказ</AlertDialogCancel>
            <Button type="button" variant="destructive" onClick={() => void confirmDeactivate()}>
              Деактивирай
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
