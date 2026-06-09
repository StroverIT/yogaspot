'use client';

import { Badge } from '@/components/ui/badge';
import type { AdminPlatformBillingRow } from '@/lib/admin-queries';
import { CreditCard } from 'lucide-react';

function formatWhen(iso: string | null) {
  if (!iso) return '-';
  return new Date(iso).toLocaleString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusLabel(status: string): string {
  switch (status) {
    case 'trial':
      return 'Пробен период';
    case 'active':
      return 'Активен';
    case 'past_due':
      return 'Просрочен';
    case 'blocked':
      return 'Блокиран';
    case 'paid':
      return 'Платена';
    case 'pending':
      return 'Изчаква';
    case 'overdue':
      return 'Просрочена';
    case 'failed':
      return 'Неуспешна';
    default:
      return status;
  }
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'active' || status === 'paid') return 'default';
  if (status === 'trial' || status === 'pending') return 'secondary';
  if (status === 'past_due' || status === 'overdue') return 'outline';
  return 'destructive';
}

export type AdminPlatformBillingSectionClientProps = {
  rows: AdminPlatformBillingRow[];
};

export function AdminPlatformBillingSectionClient({ rows }: AdminPlatformBillingSectionClientProps) {
  return (
    <div>
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-md">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Платформен абонамент (B2B)
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Статус на абонаментите на студиата и история на фактурите (синхронизирано от Stripe).
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-muted-foreground">
                <th className="px-4 py-3 font-medium">Бизнес / собственик</th>
                <th className="px-4 py-3 font-medium">Статус</th>
                <th className="px-4 py-3 font-medium">Пробен до</th>
                <th className="px-4 py-3 font-medium">Следващо плащане</th>
                <th className="px-4 py-3 font-medium">Грейс до</th>
                <th className="px-4 py-3 font-medium">Цена</th>
                <th className="px-4 py-3 font-medium">Последни фактури</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Няма бизнес абонаменти.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.businessId} className="border-b border-border align-top">
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{row.businessName ?? '-'}</div>
                      <div className="text-muted-foreground">{row.ownerName ?? '-'}</div>
                      <div className="text-xs text-muted-foreground">{row.ownerEmail ?? '-'}</div>
                      {row.isEarlyAdopter ? (
                        <Badge variant="secondary" className="mt-2">
                          Първи 20
                        </Badge>
                      ) : null}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant(row.status)}>{statusLabel(row.status)}</Badge>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatWhen(row.trialEndsAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatWhen(row.nextPaymentDueAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{formatWhen(row.gracePeriodEndsAt)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">{row.monthlyAmountEur} €/мес.</td>
                    <td className="px-4 py-4">
                      {row.payments.length === 0 ? (
                        <span className="text-muted-foreground">-</span>
                      ) : (
                        <ul className="space-y-2">
                          {row.payments.map((p) => (
                            <li key={p.id} className="flex flex-wrap items-center gap-2">
                              <Badge variant={statusVariant(p.status)} className="text-xs">
                                {statusLabel(p.status)}
                              </Badge>
                              <span>
                                {p.amountEur.toFixed(2)} € · падеж {formatWhen(p.dueDate)}
                              </span>
                              {p.paidAt ? (
                                <span className="text-xs text-muted-foreground">платена {formatWhen(p.paidAt)}</span>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      )}
                      {row.stripeSubscriptionId ? (
                        <p className="mt-2 text-xs text-muted-foreground break-all">Sub: {row.stripeSubscriptionId}</p>
                      ) : null}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
