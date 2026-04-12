'use client';

import { useEffect, useRef, useState } from 'react';
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
import type { Instructor } from '@/data/mock-data';
import { mockStudios, YOGA_TYPES } from '@/data/mock-data';
import { cn } from '@/lib/utils';

const INCOMPLETE_MSG =
  'Попълнете всички полета, изберете ниво на опит, поне един стил йога и студио преди запазване.';

export type InstructorModalPayload = {
  /** When set, server updates this instructor (PATCH). */
  id?: string;
  name: string;
  bio: string;
  experienceLevel: string;
  studioId: string;
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
}: {
  open: boolean;
  onClose: () => void;
  onSave: (payload: InstructorModalPayload) => void | Promise<void>;
  studios: typeof mockStudios;
  /** When set, form opens with this instructor’s data. */
  instructorToEdit?: Instructor | null;
}) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [studioId, setStudioId] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (instructorToEdit) {
      setName(instructorToEdit.name);
      setBio(instructorToEdit.bio);
      setExperienceLevel(instructorToEdit.experienceLevel);
      setStudioId(instructorToEdit.studioId);
      setSelectedStyles([...instructorToEdit.yogaStyle]);
      setPhoto(instructorToEdit.photo?.trim() ?? '');
      return;
    }
    setName('');
    setBio('');
    setExperienceLevel('');
    setStudioId('');
    setSelectedStyles([]);
    setPhoto('');
  }, [open, instructorToEdit]);

  const handleSave = async () => {
    if (
      !name.trim()
      || !bio.trim()
      || !experienceLevel
      || selectedStyles.length === 0
      || !studioId
    ) {
      toast.error(INCOMPLETE_MSG);
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
          studioId,
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
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {instructorToEdit ? 'Редактирай инструктор' : 'Нов инструктор'}
          </DialogTitle>
          <DialogDescription>
            {instructorToEdit
              ? 'Променете данните и запазете.'
              : 'Добавете данните за новия инструктор.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
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
          <div>
            <Label>Назначено студио</Label>
            <Select value={studioId || undefined} onValueChange={setStudioId}>
              <SelectTrigger className="mt-1">
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
          </div>
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
                    : '—'}
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
                      if (!studioId) {
                        toast.error('Първо изберете студио, за да качите снимка.');
                        return;
                      }
                      setPhotoUploading(true);
                      try {
                        const fd = new FormData();
                        fd.append('studioId', studioId);
                        fd.append('file', f);
                        const res = await fetch('/api/dashboard/instructors/photo', { method: 'POST', body: fd });
                        const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
                        if (!res.ok) {
                          toast.error(typeof j.error === 'string' ? j.error : `Качването не успя (${res.status})`);
                          return;
                        }
                        if (typeof j.url === 'string' && j.url) {
                          setPhoto(j.url);
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
        <DialogFooter className="mt-4">
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
