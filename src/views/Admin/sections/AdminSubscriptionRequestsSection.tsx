'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { AdminSubscriptionRequestListItem } from '@/lib/admin-queries';
import { formatMonthlyDualFromBgn } from '@/lib/eur-bgn';
import { Building2, Check, CreditCard, X } from 'lucide-react';

export type AdminSubscriptionRequestsSectionClientProps = {
  requests: AdminSubscriptionRequestListItem[];
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminSubscriptionRequestsSectionClient({ requests: initialRequests }: AdminSubscriptionRequestsSectionClientProps) {
  const router = useRouter();
  const [declineTarget, setDeclineTarget] = useState<AdminSubscriptionRequestListItem | null>(null);
  const [declineNote, setDeclineNote] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);

  const patch = async (id: string, action: 'accept' | 'decline', adminNote?: string) => {
    setActionId(id);
    try {
      const res = await fetch(`/api/admin/subscription-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminNote }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof j.error === 'string' ? j.error : `Грешка (${res.status})`);
        return;
      }
      toast.success(action === 'accept' ? 'Абонаментът е активиран за студиото.' : 'Заявката е отказана.');
      setDeclineTarget(null);
      setDeclineNote('');
      router.refresh();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-md">
        <div className="p-4 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Заявки за абонамент</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Последните изчакващи заявки (до 5). Одобрение активира месечния абонамент за студиото.
          </p>
        </div>
        <div className="divide-y divide-border">
          {initialRequests.length === 0 ? (
            <p className="text-sm text-muted-foreground px-5 py-10 text-center">Няма изчакващи заявки.</p>
          ) : (
            initialRequests.map(req => (
              <div key={req.id} className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{req.studioName}</span>
                      <Badge variant="secondary" className="text-xs">
                        Изчаква
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Собственик: {req.ownerName || '—'}
                      {req.ownerEmail ? ` · ${req.ownerEmail}` : ''}
                    </p>
                    <div className="mt-3 flex items-start gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">{req.name}</p>
                        <p className="tabular-nums text-primary font-semibold leading-snug">{formatMonthlyDualFromBgn(req.monthlyPrice)}</p>
                        <p className="text-muted-foreground mt-1 line-clamp-3 whitespace-pre-wrap">{req.includes}</p>
                        <p className="text-xs text-muted-foreground mt-2">{formatWhen(req.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                  <Button
                    type="button"
                    size="sm"
                    className="gap-1.5 rounded-xl"
                    disabled={actionId !== null}
                    onClick={() => void patch(req.id, 'accept')}
                  >
                    <Check className="h-4 w-4" />
                    Одобри
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="gap-1.5 rounded-xl border-destructive/30 text-destructive hover:bg-destructive/10"
                    disabled={actionId !== null}
                    onClick={() => {
                      setDeclineNote('');
                      setDeclineTarget(req);
                    }}
                  >
                    <X className="h-4 w-4" />
                    Откажи
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AlertDialog open={declineTarget !== null} onOpenChange={open => !open && setDeclineTarget(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Отказ на заявка</AlertDialogTitle>
            <AlertDialogDescription>
              {declineTarget ? (
                <>
                  Студио <span className="font-medium text-foreground">{declineTarget.studioName}</span> —{' '}
                  {declineTarget.name}
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="decline-note">Бележка към бизнеса (по избор)</Label>
            <Textarea
              id="decline-note"
              value={declineNote}
              onChange={e => setDeclineNote(e.target.value)}
              rows={3}
              className="rounded-xl resize-y"
              placeholder="Кратка причина…"
            />
          </div>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={actionId !== null}>Назад</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={actionId !== null || !declineTarget}
              onClick={() => declineTarget && void patch(declineTarget.id, 'decline', declineNote.trim() || undefined)}
            >
              {actionId ? 'Обработка…' : 'Потвърди отказ'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
