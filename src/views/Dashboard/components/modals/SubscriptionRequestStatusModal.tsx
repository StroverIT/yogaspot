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
import { preventDialogOutsideClose } from '@/views/Dashboard/components/preventDialogOutsideClose';
import type { SubscriptionRequestDto, SubscriptionRequestStatus } from '@/data/mock-data';

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

export function SubscriptionRequestStatusModal({
  open,
  onClose,
  request,
  studioName,
  onOpenFullDetails,
}: {
  open: boolean;
  onClose: () => void;
  request: SubscriptionRequestDto | null;
  studioName: string;
  onOpenFullDetails: () => void;
}) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent {...preventDialogOutsideClose} className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Статус на заявката</DialogTitle>
          <DialogDescription>
            Заявка за абонамент към <span className="font-medium text-foreground">{studioName}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2 text-sm">
          <p>
            <span className="text-muted-foreground">Статус: </span>
            <span className="font-semibold text-foreground">{statusLabel(request.status)}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Подадена: </span>
            {formatWhen(request.createdAt)}
          </p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Затвори
          </Button>
          <Button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullDetails();
            }}
          >
            Пълни детайли
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
