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
import type { SubscriptionVideo } from '@/data/mock-data';
import { useDashboardWorkspaceContext } from '@/contexts/DashboardWorkspaceContext';
import { VideosSection } from '@/views/Dashboard/components/VideosSection';
import { VideoModal, type VideoModalPayload } from '@/views/Dashboard/components/modals/VideoModal';

export default function DashboardVideosPage() {
  const ws = useDashboardWorkspaceContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<SubscriptionVideo | null>(null);
  const [pendingDelete, setPendingDelete] = useState<SubscriptionVideo | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  const myStudioIds = useMemo(() => new Set(ws.studios.map(s => s.id)), [ws.studios]);
  const myVideos = useMemo(
    () => ws.subscriptionVideos.filter(video => myStudioIds.has(video.studioId)),
    [ws.subscriptionVideos, myStudioIds],
  );

  const closeModal = () => {
    setModalOpen(false);
    setEditingVideo(null);
  };

  const handleSave = async (payload: VideoModalPayload) => {
    const isEdit = Boolean(payload.id);
    const res = await fetch(
      isEdit ? `/api/dashboard/subscription-videos/${payload.id}` : '/api/dashboard/subscription-videos',
      {
        method: isEdit ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: payload.studioId,
          title: payload.title || undefined,
          youtubeUrl: payload.youtubeUrl,
          subscriptionIds: payload.subscriptionIds,
        }),
      },
    );
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      toast.error(typeof j.error === 'string' ? j.error : `Неуспешно запазване (${res.status})`);
      return;
    }
    toast.success(isEdit ? 'Видеото е обновено.' : 'Видеото е добавено.');
    closeModal();
    void ws.reload();
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteInProgress(true);
    try {
      const res = await fetch(`/api/dashboard/subscription-videos/${pendingDelete.id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изтриване (${res.status})`);
        return;
      }
      toast.success('Видеото беше изтрито.');
      if (editingVideo?.id === pendingDelete.id) closeModal();
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
      <VideosSection
        videos={myVideos}
        studios={ws.studios}
        subscriptions={ws.subscriptions}
        onAdd={() => {
          setEditingVideo(null);
          setModalOpen(true);
        }}
        onEdit={video => {
          setEditingVideo(video);
          setModalOpen(true);
        }}
        onDelete={setPendingDelete}
      />

      <VideoModal
        open={modalOpen}
        onClose={closeModal}
        onSave={handleSave}
        studios={ws.studios}
        subscriptions={ws.subscriptions}
        videoToEdit={editingVideo}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={open => !open && !deleteInProgress && setPendingDelete(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader className="sm:text-center">
            <AlertDialogTitle className="font-display">Изтриване на видео</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Сигурни ли сте, че искате да изтриете{' '}
              <span className="font-medium text-foreground">
                {pendingDelete?.title?.trim() || 'това видео'}
              </span>
              ?
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
