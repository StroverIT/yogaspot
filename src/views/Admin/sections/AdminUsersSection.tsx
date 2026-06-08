'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Trash2 } from 'lucide-react';
import type { Role } from '@prisma/client';
import type { AdminUserRow } from '@/lib/admin-queries';

export type AdminUsersSectionClientProps = {
  users: AdminUserRow[];
};

const ROLE_OPTIONS: { value: Role; label: string }[] = [
  { value: 'client', label: 'Потребител' },
  { value: 'business', label: 'Бизнес' },
  { value: 'admin', label: 'Админ' },
];

function roleLabel(role: Role) {
  return ROLE_OPTIONS.find(r => r.value === role)?.label ?? role;
}

export function AdminUsersSectionClient({ users }: AdminUsersSectionClientProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [rows, setRows] = useState(users);
  const [search, setSearch] = useState('');
  const [manageTarget, setManageTarget] = useState<AdminUserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('client');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isBusy = saving || deleting;
  const isOwnAccount = manageTarget?.id === currentUser?.id;

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      u => (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
    );
  }, [search, rows]);

  const openManage = (user: AdminUserRow) => {
    setManageTarget(user);
    setSelectedRole(user.role);
  };

  const closeManage = () => {
    if (isBusy) return;
    setManageTarget(null);
    setDeleteConfirmOpen(false);
  };

  const saveRole = async () => {
    if (!manageTarget || selectedRole === manageTarget.role) {
      closeManage();
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${manageTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof j.error === 'string' ? j.error : `Грешка (${res.status})`);
        return;
      }

      setRows(prev =>
        prev.map(u => (u.id === manageTarget.id ? { ...u, role: selectedRole } : u)),
      );
      toast.success('Ролята е обновена.');
      setManageTarget(null);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const deleteAccount = async () => {
    if (!manageTarget) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${manageTarget.id}`, { method: 'DELETE' });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(typeof j.error === 'string' ? j.error : `Грешка (${res.status})`);
        return;
      }

      setRows(prev => prev.filter(u => u.id !== manageTarget.id));
      toast.success('Акаунтът е изтрит.');
      setDeleteConfirmOpen(false);
      setManageTarget(null);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <div className="rounded-2xl border border-border bg-white overflow-hidden shadow-md">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Търси по име или имейл..."
              className="pl-10 rounded-xl bg-white"
              type="search"
              autoComplete="off"
            />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="text-left p-4 font-medium text-muted-foreground">Потребител</th>
              <th className="text-left p-4 font-medium text-muted-foreground">Роля</th>
              <th className="text-left p-4 font-medium text-muted-foreground hidden sm:table-cell">Статус</th>
              <th className="text-right p-4 font-medium text-muted-foreground">Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-sm text-muted-foreground">
                  Няма потребители за това търсене.
                </td>
              </tr>
            ) : (
              filteredUsers.map(u => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {(u.name ?? u.email ?? '?')[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{u.name ?? '—'}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={u.role === 'business' ? 'default' : 'secondary'} className="rounded-full">
                      {roleLabel(u.role)}
                    </Badge>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="text-sm text-muted-foreground">Активен</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg"
                      onClick={() => openManage(u)}
                    >
                      Управление
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={manageTarget !== null} onOpenChange={open => !open && closeManage()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Управление на потребител</DialogTitle>
            <DialogDescription>
              Промяна на ролята за {manageTarget?.name ?? manageTarget?.email ?? 'потребителя'}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-role">Роля</Label>
              <Select value={selectedRole} onValueChange={v => setSelectedRole(v as Role)} disabled={isBusy}>
                <SelectTrigger id="user-role" className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
              <div>
                <p className="text-sm font-medium text-destructive">Изтриване на акаунт</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Това действие е необратимо. Свързаните данни (резервации, бизнес профил, студиа) също ще бъдат
                  премахнати.
                </p>
                {isOwnAccount && (
                  <p className="text-xs text-destructive mt-2">Не можете да изтриете собствения си акаунт.</p>
                )}
              </div>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="rounded-xl gap-1.5"
                disabled={isBusy || isOwnAccount}
                onClick={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
                Изтрий акаунт
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="rounded-xl" disabled={isBusy} onClick={closeManage}>
              Отказ
            </Button>
            <Button
              type="button"
              className="rounded-xl"
              disabled={isBusy || selectedRole === manageTarget?.role}
              onClick={() => void saveRole()}
            >
              {saving ? 'Запазване...' : 'Запази'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={open => !open && !deleting && setDeleteConfirmOpen(false)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Изтриване на акаунт</AlertDialogTitle>
            <AlertDialogDescription>
              Сигурни ли сте, че искате да изтриете акаунта на{' '}
              <span className="font-medium text-foreground">
                {manageTarget?.name ?? manageTarget?.email ?? 'този потребител'}
              </span>
              ? Това действие не може да бъде отменено.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel disabled={deleting}>Отказ</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              className="rounded-xl"
              disabled={deleting || !manageTarget}
              onClick={() => void deleteAccount()}
            >
              {deleting ? 'Изтриване...' : 'Потвърди изтриване'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
