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
import type { Retreat } from '@/data/mock-data';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { RetreatsSection } from '@/views/Dashboard/components/RetreatsSection';
import { NEW_IMAGE_SLOT_MARKER, RetreatModal, type RetreatModalPayload } from '@/views/Dashboard/components/modals/RetreatModal';

export default function DashboardRetreatsPage() {
  const ws = useDashboardWorkspaceContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRetreat, setEditingRetreat] = useState<Retreat | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Retreat | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const myStudioIds = useMemo(() => new Set(ws.studios.map((s) => s.id)), [ws.studios]);
  const myRetreats = useMemo(
    () => ws.retreats.filter((r) => myStudioIds.has(r.studioId)),
    [ws.retreats, myStudioIds],
  );

  const closeModal = () => {
    setModalOpen(false);
    setEditingRetreat(null);
  };

  const handleSave = async (payload: RetreatModalPayload) => {
    const isEdit = Boolean(payload.id);
    const formData = new FormData();
    formData.append('studioId', payload.studioId);
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    formData.append('address', payload.address);
    formData.append('lat', String(payload.lat));
    formData.append('lng', String(payload.lng));
    formData.append('startDate', payload.startDate);
    formData.append('endDate', payload.endDate);
    formData.append('duration', payload.duration);
    formData.append('maxCapacity', String(payload.maxCapacity));
    formData.append('price', String(payload.price));
    formData.append('paymentMode', payload.paymentMode);
    formData.append('isPublished', String(payload.isPublished));
    payload.activities.forEach((activity) => formData.append('activities', activity));

    if (isEdit) {
      payload.imageSlots.forEach((slot) => {
        if (slot.kind === 'url') {
          formData.append('imageSlot', slot.url);
        } else {
          formData.append('imageSlot', NEW_IMAGE_SLOT_MARKER);
          formData.append('images', slot.file);
        }
      });
    } else {
      payload.imageSlots.forEach((slot) => {
        if (slot.kind === 'file') formData.append('images', slot.file);
      });
    }

    const res = await fetch(isEdit ? `/api/dashboard/retreats/${payload.id}` : '/api/dashboard/retreats', {
      method: isEdit ? 'PATCH' : 'POST',
      body: formData,
    });
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      return;
    }
    toast.success(isEdit ? 'Рийтрийтът е обновен.' : 'Рийтрийтът е създаден.');
    closeModal();
    void ws.reload();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteInProgress(true);
    try {
      const res = await fetch(`/api/dashboard/retreats/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изтриване (${res.status})`);
        return;
      }
      toast.success('Рийтрийтът беше изтрит.');
      if (editingRetreat?.id === pendingDelete.id) closeModal();
      setPendingDelete(null);
      void ws.reload();
    } finally {
      setDeleteInProgress(false);
    }
  };

  if (ws.loading) return <div className="text-muted-foreground">Зареждане…</div>;
  if (ws.error) return <div className="text-destructive">{ws.error}</div>;

  return (
    <>
      <RetreatsSection
        retreats={myRetreats}
        studios={ws.studios}
        onAdd={() => {
          setEditingRetreat(null);
          setModalOpen(true);
        }}
        onEdit={(retreat) => {
          setEditingRetreat(retreat);
          setModalOpen(true);
        }}
        onDelete={setPendingDelete}
      />

      <RetreatModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        studios={ws.studios}
        retreatToEdit={editingRetreat}
        stripeConnect={ws.stripeConnect}
      />

      <AlertDialog open={pendingDelete !== null} onOpenChange={(open) => !open && !deleteInProgress && setPendingDelete(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="sm:text-center">
            <AlertDialogTitle className="font-display">Изтриване на рийтрийт</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Сигурни ли сте, че искате да изтриете <span className="font-medium text-foreground">{pendingDelete?.title}</span>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center sm:space-x-2">
            <AlertDialogCancel disabled={deleteInProgress}>Отказ</AlertDialogCancel>
            <Button variant="destructive" disabled={deleteInProgress} onClick={() => void confirmDelete()}>
              {deleteInProgress ? 'Изтриване…' : 'Изтрий'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
