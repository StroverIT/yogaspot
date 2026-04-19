'use client';

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
import { Button } from '@/components/ui/button';
import { ScheduleContent } from '@/components/schedule/schedule-content';
import type { ScheduleEntry } from '@/data/mock-data';
import { ScheduleModal, type ScheduleModalPayload } from '@/views/Dashboard/components/modals/ScheduleModal';
import { deriveDashboardMetrics } from '@/views/Dashboard/dashboardMockData';
import { toastDashboardSaved } from '@/views/Dashboard/dashboardSaveToast';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';

export default function DashboardSchedulePage() {
  const ws = useDashboardWorkspaceContext();
  const { myStudios, myInstructors } = deriveDashboardMetrics(ws.studios, ws.classes, ws.instructors);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleEntry | null>(null);
  const [entryPendingDelete, setEntryPendingDelete] = useState<ScheduleEntry | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const closeModal = () => {
    setScheduleModalOpen(false);
    setEditingSchedule(null);
  };

  const closeDeleteDialog = () => {
    if (deleteInProgress) return;
    setEntryPendingDelete(null);
  };

  const handleSave = async (payloads: ScheduleModalPayload[]) => {
    if (payloads.length === 0) {
      toast.error('Няма часове за запазване.');
      return;
    }

    const saveSingle = async (payload: ScheduleModalPayload, mode: 'create' | 'edit') => {
      const res = await fetch(mode === 'edit' ? `/api/dashboard/schedule/${payload.id}` : '/api/dashboard/schedule', {
        method: mode === 'edit' ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: payload.studioId,
          instructorId: payload.instructorId,
          className: payload.className,
          yogaType: payload.yogaType,
          difficulty: payload.difficulty,
          day: payload.day,
          startTime: payload.startTime,
          endTime: payload.endTime,
          maxCapacity: payload.maxCapacity,
          price: payload.price,
          isRecurring: true,
        }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        return {
          ok: false as const,
          message: typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`,
        };
      }

      return { ok: true as const };
    };

    const isEdit = payloads.length === 1 && Boolean(payloads[0]?.id);
    if (isEdit) {
      const result = await saveSingle(payloads[0], 'edit');
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toastDashboardSaved('schedule');
      closeModal();
      void ws.reload();
      return;
    }

    let successCount = 0;
    const errors: string[] = [];

    for (const payload of payloads) {
      const result = await saveSingle(payload, 'create');
      if (result.ok) {
        successCount += 1;
      } else {
        errors.push(result.message);
      }
    }

    if (successCount === payloads.length) {
      toastDashboardSaved('schedule');
      closeModal();
      void ws.reload();
      return;
    }

    if (successCount > 0) {
      toast.error(`Добавени са ${successCount} от ${payloads.length} часа. ${errors[0] ?? ''}`.trim());
      closeModal();
      void ws.reload();
      return;
    }

    toast.error(errors[0] ?? 'Неуспешно запазване.');
  };

  const confirmDeleteEntry = async () => {
    if (!entryPendingDelete) return;
    setDeleteInProgress(true);
    try {
      const res = await fetch(`/api/dashboard/schedule/${entryPendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изтриване (${res.status})`);
        return;
      }
      toast.success('Часът беше изтрит от разписанието.');
      if (editingSchedule?.id === entryPendingDelete.id) {
        closeModal();
      }
      setEntryPendingDelete(null);
      void ws.reload();
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <>
      <ScheduleContent
        variant="admin"
        studios={myStudios}
        schedule={ws.schedule}
        subscriptions={ws.subscriptions}
        subscriptionRequests={ws.subscriptionRequests}
        onWorkspaceReload={() => void ws.reload()}
        instructors={myInstructors}
        onAdd={() => {
          if (myStudios.length === 0) {
            toast.info('Първо създайте студио в раздел Студиа.');
            return;
          }
          setEditingSchedule(null);
          setScheduleModalOpen(true);
        }}
        onEdit={entry => {
          setEditingSchedule(entry);
          setScheduleModalOpen(true);
        }}
        onDelete={(entry: ScheduleEntry) => setEntryPendingDelete(entry)}
      />
      <AlertDialog open={entryPendingDelete !== null} onOpenChange={open => !open && closeDeleteDialog()}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="sm:text-center">
            <AlertDialogTitle className="font-display">Изтриване от разписание</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Сигурни ли сте, че искате да изтриете часа{' '}
              <span className="font-medium text-foreground">{entryPendingDelete?.className}</span>? Това действие
              не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-2">
            <AlertDialogCancel disabled={deleteInProgress}>Отказ</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={deleteInProgress}
              className="mt-2 sm:mt-0"
              onClick={() => void confirmDeleteEntry()}
            >
              {deleteInProgress ? 'Изтриване…' : 'Изтрий'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ScheduleModal
        open={scheduleModalOpen}
        onClose={closeModal}
        onSave={handleSave}
        studios={myStudios}
        instructors={myInstructors}
        entry={editingSchedule}
        onlinePayments={ws.onlinePayments}
      />
    </>
  );
}
