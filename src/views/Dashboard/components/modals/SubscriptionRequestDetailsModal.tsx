'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { SubscriptionRequestDto, SubscriptionRequestStatus } from '@/data/mock-data';
import { formatMonthlyDualFromBgn } from '@/lib/eur-bgn';

function statusLabel(status: SubscriptionRequestStatus): string {
  switch (status) {
    case 'PENDING':
      return 'Изчаква одобрение';
    case 'ACCEPTED':
      return 'Одобрена';
    case 'DECLINED':
      return 'Отказана';
    default:
      return status;
  }
}

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SubscriptionRequestDetailsModal({
  open,
  onClose,
  request,
  studioName,
}: {
  open: boolean;
  onClose: () => void;
  request: SubscriptionRequestDto | null;
  studioName: string;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Детайли за заявката</DialogTitle>
          <DialogDescription>Студио: {studioName}</DialogDescription>
        </DialogHeader>
        <dl className="space-y-4 py-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Име на абонамента</dt>
            <dd className="mt-1 font-medium text-foreground">{request.name}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Цена</dt>
            <dd className="mt-1 font-medium tabular-nums">{formatMonthlyDualFromBgn(request.monthlyPrice)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Какво включва</dt>
            <dd className="mt-1 whitespace-pre-wrap text-foreground">{request.includes}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Статус</dt>
            <dd className="mt-1 font-medium">{statusLabel(request.status)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Подадена</dt>
            <dd className="mt-1">{formatWhen(request.createdAt)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Последна промяна</dt>
            <dd className="mt-1">{formatWhen(request.updatedAt)}</dd>
          </div>
          {request.status === 'DECLINED' && request.adminNote ? (
            <div>
              <dt className="text-muted-foreground">Бележка от администратор</dt>
              <dd className="mt-1 whitespace-pre-wrap text-foreground">{request.adminNote}</dd>
            </div>
          ) : null}
        </dl>
        <DialogFooter>
          <Button type="button" onClick={onClose}>
            Затвори
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
