'use client';

import { useEffect, useMemo, useState } from 'react';
import { Video } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { preventDialogOutsideClose } from '@/views/Dashboard/components/preventDialogOutsideClose';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Studio, StudioSubscription, SubscriptionVideo } from '@/data/mock-data';
import { extractYoutubeVideoId, youtubeThumbnailUrl } from '@/lib/youtube';

export type VideoModalPayload = {
  id?: string;
  studioId: string;
  title: string;
  youtubeUrl: string;
  subscriptionIds: string[];
};

export function VideoModal({
  open,
  onClose,
  onSave,
  studios,
  subscriptions,
  videoToEdit,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: VideoModalPayload) => void | Promise<void>;
  studios: Studio[];
  subscriptions: StudioSubscription[];
  videoToEdit?: SubscriptionVideo | null;
}) {
  const [studioId, setStudioId] = useState('');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedSubscriptionIds, setSelectedSubscriptionIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const studioSubscriptions = useMemo(
    () =>
      subscriptions.filter(
        sub => sub.studioId === studioId && sub.hasMonthlySubscription && Boolean(sub.id),
      ),
    [subscriptions, studioId],
  );

  const previewVideoId = useMemo(() => extractYoutubeVideoId(youtubeUrl), [youtubeUrl]);

  useEffect(() => {
    if (!open) return;
    if (videoToEdit) {
      setStudioId(videoToEdit.studioId);
      setTitle(videoToEdit.title ?? '');
      setYoutubeUrl(videoToEdit.youtubeUrl);
      setSelectedSubscriptionIds(videoToEdit.subscriptionIds);
      return;
    }
    setStudioId(studios[0]?.id ?? '');
    setTitle('');
    setYoutubeUrl('');
    setSelectedSubscriptionIds([]);
  }, [open, videoToEdit, studios]);

  useEffect(() => {
    if (!open || videoToEdit) return;
    setSelectedSubscriptionIds(prev => prev.filter(id => studioSubscriptions.some(sub => sub.id === id)));
  }, [open, videoToEdit, studioSubscriptions]);

  const toggleSubscription = (subscriptionId: string, checked: boolean) => {
    setSelectedSubscriptionIds(prev =>
      checked ? [...new Set([...prev, subscriptionId])] : prev.filter(id => id !== subscriptionId),
    );
  };

  const handleSubmit = async () => {
    if (!studioId || !youtubeUrl.trim() || selectedSubscriptionIds.length === 0) return;
    setSaving(true);
    try {
      await onSave({
        id: videoToEdit?.id,
        studioId,
        title: title.trim(),
        youtubeUrl: youtubeUrl.trim(),
        subscriptionIds: selectedSubscriptionIds,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave =
    Boolean(studioId) &&
    Boolean(youtubeUrl.trim()) &&
    Boolean(previewVideoId) &&
    selectedSubscriptionIds.length > 0 &&
    !saving;

  return (
    <Dialog open={open} onOpenChange={next => !next && onClose()}>
      <DialogContent {...preventDialogOutsideClose} className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            {videoToEdit ? 'Редактиране на видео' : 'Добавяне на видео'}
          </DialogTitle>
          <DialogDescription>
            Добавете YouTube линк и изберете към кой абонамент е достъпно видеото.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="video-studio">Студио</Label>
            <Select value={studioId} onValueChange={setStudioId} disabled={Boolean(videoToEdit)}>
              <SelectTrigger id="video-studio">
                <SelectValue placeholder="Изберете студио" />
              </SelectTrigger>
              <SelectContent>
                {studios.map(studio => (
                  <SelectItem key={studio.id} value={studio.id}>
                    {studio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-title">Заглавие (по избор)</Label>
            <Input
              id="video-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Напр. Утринна практика"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="video-url">YouTube линк</Label>
            <Input
              id="video-url"
              value={youtubeUrl}
              onChange={e => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
            />
            {youtubeUrl.trim() && !previewVideoId ? (
              <p className="text-xs text-destructive">Невалиден YouTube линк.</p>
            ) : null}
          </div>

          {previewVideoId ? (
            <div className="overflow-hidden rounded-xl border border-border/80">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={youtubeThumbnailUrl(previewVideoId)}
                alt="YouTube преглед"
                className="aspect-video w-full object-cover"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>Абонаменти с достъп</Label>
            {studioSubscriptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Няма активен абонамент за това студио. Създайте абонамент от секцията „Абонаменти“.
              </p>
            ) : (
              <div className="space-y-2 rounded-xl border border-border/80 p-3">
                {studioSubscriptions.map(sub => {
                  const label = sub.name?.trim() || 'Абонамент';
                  return (
                    <label key={sub.id} className="flex cursor-pointer items-start gap-3 text-sm">
                      <Checkbox
                        checked={selectedSubscriptionIds.includes(sub.id)}
                        onCheckedChange={checked => toggleSubscription(sub.id, checked === true)}
                      />
                      <span>
                        <span className="font-medium text-foreground">{label}</span>
                        {sub.monthlyPrice != null ? (
                          <span className="mt-0.5 block text-muted-foreground">
                            {sub.monthlyPrice.toFixed(2)} лв./мес.
                          </span>
                        ) : null}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
            Отказ
          </Button>
          <Button type="button" onClick={() => void handleSubmit()} disabled={!canSave}>
            {saving ? 'Запазване…' : videoToEdit ? 'Запази' : 'Добави'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
