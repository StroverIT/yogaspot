'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { Instructor, TeachingMode } from '@/data/mock-data';
import { mockStudios, YOGA_TYPES } from '@/data/mock-data';
import { isValidZoomMeetingUrl } from '@/lib/teaching-mode';
import { cn } from '@/lib/utils';
import { Building2, Video } from 'lucide-react';

const INCOMPLETE_PHYSICAL_MSG =
  'Попълнете всички полета, изберете ниво на опит, поне един стил йога и студио преди запазване.';
const INCOMPLETE_ONLINE_MSG =
  'Попълнете всички полета, изберете ниво и стил йога, и добавете валиден Zoom линк.';

export type InstructorModalPayload = {
  /** When set, server updates this instructor (PATCH). */
  id?: string;
  name: string;
  bio: string;
  experienceLevel: string;
  studioId?: string;
  teachingMode: TeachingMode;
  zoomMeetingUrl?: string;
  yogaStyle: string[];
  /** Public image URL (Supabase or external). */
  photo?: string;
};

export function InstructorModal({
  open,
  onClose,
  onSave,
  studios,
  instructorToEdit,
  defaultStudioId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: InstructorModalPayload) => void | Promise<void>;
  studios: typeof mockStudios;
  /** When set, form opens with this instructor’s data. */
  instructorToEdit?: Instructor | null;
  /** Pre-select studio when creating a new instructor (e.g. from class modal). */
  defaultStudioId?: string | null;
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('online');
  const [zoomMeetingUrl, setZoomMeetingUrl] = useState('');
  const [studioId, setStudioId] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const physicalStudios = useMemo(
    () => studios.filter(s => s.teachingMode !== 'online'),
    [studios],
  );
  const isOnlineMode = teachingMode === 'online';
  const linkedStudio = instructorToEdit
    ? studios.find(s => s.id === instructorToEdit.studioId)
    : null;

  useEffect(() => {
    if (!open) return;
    if (instructorToEdit) {
      const mode = linkedStudio?.teachingMode ?? 'physical';
      setName(instructorToEdit.name);
      setBio(instructorToEdit.bio);
      setExperienceLevel(instructorToEdit.experienceLevel);
      setTeachingMode(mode);
      setZoomMeetingUrl(linkedStudio?.zoomMeetingUrl ?? '');
      setStudioId(instructorToEdit.studioId);
      setSelectedStyles([...instructorToEdit.yogaStyle]);
      setPhoto(instructorToEdit.photo?.trim() ?? '');
      return;
    }
    const presetStudio = defaultStudioId ? studios.find(s => s.id === defaultStudioId) : null;
    setName('');
    setBio('');
    setExperienceLevel('');
    if (presetStudio) {
      const mode = presetStudio.teachingMode === 'online' ? 'online' : 'physical';
      setTeachingMode(mode);
      setStudioId(presetStudio.id);
      setZoomMeetingUrl(presetStudio.zoomMeetingUrl ?? '');
    } else {
      setTeachingMode(physicalStudios.length > 0 ? 'physical' : 'online');
      setZoomMeetingUrl('');
      setStudioId(physicalStudios[0]?.id ?? '');
    }
    setSelectedStyles([]);
    setPhoto('');
  }, [open, instructorToEdit, linkedStudio, physicalStudios, defaultStudioId, studios]);

  useEffect(() => {
    if (!open || instructorToEdit) return;
    if (!isOnlineMode && physicalStudios.length > 0 && !studioId) {
      setStudioId(physicalStudios[0].id);
    }
  }, [open, instructorToEdit, isOnlineMode, physicalStudios, studioId]);

  const handleSave = async () => {
    const baseIncomplete =
      !name.trim() || !bio.trim() || !experienceLevel || selectedStyles.length === 0;

    if (isOnlineMode) {
      if (baseIncomplete || !isValidZoomMeetingUrl(zoomMeetingUrl)) {
        toast.error(INCOMPLETE_ONLINE_MSG);
        return;
      }
    } else if (baseIncomplete || !studioId) {
      toast.error(INCOMPLETE_PHYSICAL_MSG);
      return;
    }

    setSaving(true);
    try {
      await Promise.resolve(
        onSave({
          id: instructorToEdit?.id,
          name: name.trim(),
          bio: bio.trim(),
          experienceLevel,
          teachingMode,
          zoomMeetingUrl: isOnlineMode ? zoomMeetingUrl.trim() : undefined,
          studioId: isOnlineMode ? instructorToEdit?.studioId ?? studioId : studioId,
          yogaStyle: [...selectedStyles],
          photo: photo.trim(),
        }),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="flex max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-h-[85vh] sm:gap-4 sm:overflow-y-auto sm:p-6">
        <DialogHeader className="shrink-0 space-y-1.5 px-4 pb-2 pt-5 text-left sm:px-0 sm:pt-0 sm:pr-14">
          <DialogTitle className="font-display text-xl">
            {instructorToEdit ? 'Редактирай инструктор' : 'Нов инструктор'}
          </DialogTitle>
          <DialogDescription>
            {instructorToEdit
              ? 'Променете данните и запазете.'
              : 'Създайте онлайн профил или добавете инструктор към студио в зала.'}
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-2 sm:px-0 sm:pb-0">
        <div className="space-y-4">
          {!instructorToEdit ? (
            <div>
              <Label className="mb-2 block">Как преподавате?</Label>
              <div className="inline-flex w-full rounded-2xl border border-border bg-muted/40 p-1.5">
                <button
                  type="button"
                  onClick={() => setTeachingMode('physical')}
                  disabled={physicalStudios.length === 0}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                    !isOnlineMode
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                    physicalStudios.length === 0 && 'opacity-50',
                  )}
                >
                  <Building2 className="h-4 w-4 shrink-0" />
                  В студио
                </button>
                <button
                  type="button"
                  onClick={() => setTeachingMode('online')}
                  className={cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all',
                    isOnlineMode
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <Video className="h-4 w-4 shrink-0" />
                  Онлайн
                </button>
              </div>
              {physicalStudios.length === 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Нямате физическо студио - създайте директно онлайн профил.
                </p>
              ) : null}
            </div>
          ) : null}
          <div>
            <Label>Име</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="напр. Мария Иванова"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Биография</Label>
            <Textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Разкажете за опита и квалификациите..."
              className="mt-1"
              rows={3}
            />
          </div>
          <div>
            <Label>Ниво на опит</Label>
            <Select value={experienceLevel || undefined} onValueChange={setExperienceLevel}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Изберете ниво" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Начинаещ">Начинаещ</SelectItem>
                <SelectItem value="Среден">Среден</SelectItem>
                <SelectItem value="Напреднал">Напреднал</SelectItem>
                <SelectItem value="Експерт">Експерт</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Стил йога</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {YOGA_TYPES.map(type => {
                const selected = selectedStyles.includes(type);
                return (
                  <Badge
                    key={type}
                    role="button"
                    tabIndex={0}
                    aria-pressed={selected}
                    variant={selected ? 'default' : 'outline'}
                    className={cn(
                      'cursor-pointer transition-colors',
                      selected ? 'hover:bg-primary/90' : 'hover:bg-primary/10',
                    )}
                    onClick={() => {
                      setSelectedStyles(prev =>
                        selected ? prev.filter(t => t !== type) : [...prev, type],
                      );
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedStyles(prev =>
                          selected ? prev.filter(t => t !== type) : [...prev, type],
                        );
                      }
                    }}
                  >
                    {type}
                  </Badge>
                );
              })}
            </div>
          </div>
          {isOnlineMode ? (
            <div>
              <Label>Zoom линк за класовете</Label>
              <Input
                value={zoomMeetingUrl}
                onChange={e => setZoomMeetingUrl(e.target.value)}
                placeholder="https://zoom.us/j/..."
                className="mt-1"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                Задължителен за онлайн класове. Практикуващите получават линка след запис.
              </p>
            </div>
          ) : (
            <div>
              <Label>Назначено студио</Label>
              <Select value={studioId || undefined} onValueChange={setStudioId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Изберете студио" />
                </SelectTrigger>
                <SelectContent>
                  {physicalStudios.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label>Профилна снимка</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Качете файл или поставете публичен линк към изображение.
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <Avatar className="h-16 w-16 border border-border">
                {photo ? <AvatarImage src={photo} alt={name.trim() || 'Профилна снимка'} /> : null}
                <AvatarFallback className="bg-muted text-sm font-medium text-muted-foreground">
                  {name.trim()
                    ? name
                      .trim()
                      .split(/\s+/)
                      .map(part => part[0])
                      .join('')
                      .slice(0, 2)
                    : '-'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-wrap gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (!f) return;
                    void (async () => {
                      if (!isOnlineMode && !studioId) {
                        toast.error('Първо изберете студио, за да качите снимка.');
                        return;
                      }
                      if (isOnlineMode && (!name.trim() || !isValidZoomMeetingUrl(zoomMeetingUrl))) {
                        toast.error('Въведете име и валиден Zoom линк, за да качите снимка.');
                        return;
                      }
                      setPhotoUploading(true);
                      try {
                        const fd = new FormData();
                        if (isOnlineMode) {
                          fd.append('onlineProfile', 'true');
                          fd.append('instructorName', name.trim());
                          fd.append('zoomMeetingUrl', zoomMeetingUrl.trim());
                          if (studioId) fd.append('studioId', studioId);
                        } else {
                          fd.append('studioId', studioId);
                        }
                        fd.append('file', f);
                        const res = await fetch('/api/dashboard/instructors/photo', { method: 'POST', body: fd });
                        const j = (await res.json().catch(() => ({}))) as {
                          url?: string;
                          studioId?: string;
                          error?: string;
                        };
                        if (!res.ok) {
                          toast.error(typeof j.error === 'string' ? j.error : `Качването не успя (${res.status})`);
                          return;
                        }
                        if (typeof j.url === 'string' && j.url) {
                          setPhoto(j.url);
                          if (isOnlineMode && typeof j.studioId === 'string') {
                            setStudioId(j.studioId);
                          }
                          toast.success('Снимката е качена.');
                        }
                      } finally {
                        setPhotoUploading(false);
                      }
                    })();
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  disabled={photoUploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="h-4 w-4" />
                  {photoUploading ? 'Качване…' : 'Избери файл'}
                </Button>
                {photo ? (
                  <Button type="button" variant="ghost" size="sm" className="gap-1 text-muted-foreground" onClick={() => setPhoto('')}>
                    <X className="h-4 w-4" />
                    Премахни
                  </Button>
                ) : null}
              </div>
            </div>
            <Input
              value={photo}
              onChange={e => setPhoto(e.target.value)}
              placeholder="https://…"
              className="mt-2"
              inputMode="url"
              autoComplete="off"
            />
          </div>
        </div>
        </div>
        <DialogFooter className="mt-0 shrink-0 gap-3 border-t bg-background px-4 py-4 sm:mt-4 sm:border-t-0 sm:px-0 sm:py-0 [&_button]:w-full sm:[&_button]:w-auto">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving || photoUploading}>
            {saving ? 'Запазване…' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
