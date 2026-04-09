import { Shield } from 'lucide-react';

export function AdminHeader() {
  return (
    <div className="bg-gradient-to-br from-primary/8 via-background to-sage/15 border-b border-border">
      <div className="container mx-auto px-4 py-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Администрация</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-1">Админ панел</h1>
          <p className="text-muted-foreground">Пълен контрол над платформата Zenno</p>
        </div>
      </div>
    </div>
  );
}
