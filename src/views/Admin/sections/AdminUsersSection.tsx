import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const mockUsers = [
  { name: 'Анна Кирилова', email: 'anna@mail.bg', role: 'client' as const, active: true },
  { name: 'Студио Лотос', email: 'lotos@biz.bg', role: 'business' as const, active: true },
  { name: 'Петър Димов', email: 'petar@mail.bg', role: 'client' as const, active: false },
];

export function AdminUsersSection() {
  return (
    <div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Търси потребител..." className="pl-10 rounded-xl" />
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
            {mockUsers.map((u, i) => (
              <tr key={i} className="border-t border-border hover:bg-muted/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {u.name[0]}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{u.name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={u.role === 'business' ? 'default' : 'secondary'} className="rounded-full">
                    {u.role === 'client' ? 'Потребител' : 'Бизнес'}
                  </Badge>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${u.active ? 'bg-primary' : 'bg-muted-foreground/40'}`} />
                    <span className="text-sm text-muted-foreground">{u.active ? 'Активен' : 'Неактивен'}</span>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive rounded-lg">
                    Спри достъп
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
