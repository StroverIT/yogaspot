'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import type { Role } from '@prisma/client';

type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
};

export function AdminUsersSection() {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/users')
      .then((r) => (r.ok ? r.json() : { users: [] }))
      .then((j: { users: AdminUserRow[] }) => setUsers(j.users ?? []));
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      u => (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q),
    );
  }, [search, users]);

  const roleLabel = (role: Role) => {
    if (role === 'admin') return 'Админ';
    if (role === 'business') return 'Бизнес';
    return 'Потребител';
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
                  <Button variant="outline" size="sm" className="rounded-lg" disabled>
                    Управление
                  </Button>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
