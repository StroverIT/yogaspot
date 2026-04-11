'use client';

import type { Studio } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeOff, Search, Star, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type AdminStudioRow = Studio & { ownerEmail?: string | null; ownerName?: string | null };

export function AdminStudiosSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [studios, setStudios] = useState<AdminStudioRow[]>([]);

  useEffect(() => {
    fetch('/api/admin/studios')
      .then((r) => (r.ok ? r.json() : { studios: [] }))
      .then((j: { studios: AdminStudioRow[] }) => setStudios(j.studios ?? []));
  }, []);

  const filtered = studios.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.ownerEmail ?? '').toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Търси студио..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl bg-white" />
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map(studio => (
          <div
            key={studio.id}
            className="rounded-xl border border-border bg-white p-5 flex items-center justify-between hover:shadow-md transition-shadow shadow-md"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-sage/30 flex items-center justify-center text-xl">🧘</div>
              <div>
                <h3 className="font-semibold text-foreground">{studio.name}</h3>
                <p className="text-sm text-muted-foreground">{studio.address}</p>
                {studio.ownerEmail && (
                  <p className="text-xs text-muted-foreground mt-0.5">Собственик: {studio.ownerEmail}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-sm font-bold text-accent">{studio.rating}</span>
              </div>
              <Button variant="ghost" size="sm" className="rounded-lg">
                <EyeOff className="h-4 w-4 mr-1.5" /> Скрий
              </Button>
              <Button variant="ghost" size="sm" className="rounded-lg text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1.5" /> Изтрий
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
