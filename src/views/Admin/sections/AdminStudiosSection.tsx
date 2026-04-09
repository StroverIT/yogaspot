import { mockStudios } from '@/data/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EyeOff, Search, Star, Trash2 } from 'lucide-react';
import { useState } from 'react';

export function AdminStudiosSection() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Търси студио..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 rounded-xl" />
        </div>
      </div>
      <div className="space-y-3">
        {mockStudios.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase())).map(studio => (
          <div
            key={studio.id}
            className="rounded-xl border border-border bg-card p-5 flex items-center justify-between hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-sage/30 flex items-center justify-center text-xl">🧘</div>
              <div>
                <h3 className="font-semibold text-foreground">{studio.name}</h3>
                <p className="text-sm text-muted-foreground">{studio.address}</p>
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
