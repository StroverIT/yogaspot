'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

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
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (instructorToEdit) {
      setName(instructorToEdit.name);
      setBio(instructorToEdit.bio);
      setExperienceLevel(instructorToEdit.experienceLevel);
      setStudioId(instructorToEdit.studioId);
      setSelectedStyles([...instructorToEdit.yogaStyle]);
      return;
    }
    setName('');
    setBio('');
    setExperienceLevel('');
    setStudioId('');
    setSelectedStyles([]);
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
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Отказ
          </Button>
          <Button onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Запазване…' : 'Запази'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
