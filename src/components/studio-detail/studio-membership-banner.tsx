import { CheckCircle2 } from 'lucide-react';

export function StudioMembershipBanner() {
  return (
    <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <div>
        <p className="text-sm font-semibold text-foreground">Вече сте абонирани</p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Имате активен абонамент за това студио. Можете да се записвате за часове от разписанието.
        </p>
      </div>
    </div>
  );
}
