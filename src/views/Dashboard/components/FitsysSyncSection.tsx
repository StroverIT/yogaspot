'use client';

import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, ExternalLink, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Studio } from '@/data/mock-data';
import type { FitsysSyncRequestDto } from '@/lib/fitsys-sync-request-dto';
import { dashboardCardClass } from '../dashboardUi';
import { DashboardPageHeader } from './DashboardPageHeader';

function statusMessage(request: FitsysSyncRequestDto | undefined): string | null {
  if (!request) return null;
  if (request.status === 'PENDING') {
    return 'Заявката е изпратена успешно. Скоро нашите програмисти ще синхронизират графиците.';
  }
  if (request.status === 'SYNCED') {
    return 'Графикът е синхронизиран с fitsys.';
  }
  if (request.status === 'DECLINED') {
    return 'Заявката не може да бъде изпълнена. Свържете се с нас за помощ.';
  }
  return null;
}

export function FitsysSyncSection({ studios }: { studios: Studio[] }) {
  const [requests, setRequests] = useState<FitsysSyncRequestDto[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [selectedStudio, setSelectedStudio] = useState(studios[0]?.id ?? '');
  const [fitsysUrl, setFitsysUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (studios[0]?.id && !selectedStudio) {
      setSelectedStudio(studios[0].id);
    }
  }, [studios, selectedStudio]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoadingRequests(true);
      try {
        const res = await fetch('/api/dashboard/fitsys-sync', { cache: 'no-store' });
        if (!res.ok) throw new Error('load_failed');
        const j = (await res.json()) as { requests?: FitsysSyncRequestDto[] };
        if (!cancelled) setRequests(j.requests ?? []);
      } catch {
        if (!cancelled) toast.error('Неуспешно зареждане на заявките за fitsys.');
      } finally {
        if (!cancelled) setLoadingRequests(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const latestRequestForStudio = useMemo(() => {
    return requests.find((r) => r.studioId === selectedStudio);
  }, [requests, selectedStudio]);

  useEffect(() => {
    setSubmitted(false);
    setFitsysUrl('');
  }, [selectedStudio]);

  const showSuccessState =
    (submitted || latestRequestForStudio?.status === 'PENDING') && !fitsysUrl.trim();

  const statusText = statusMessage(latestRequestForStudio);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedStudio) {
      toast.error('Изберете студио.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/dashboard/fitsys-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studioId: selectedStudio, fitsysUrl }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; request?: FitsysSyncRequestDto };
      if (!res.ok) {
        toast.error(typeof j.error === 'string' ? j.error : `Неуспешно изпращане (${res.status})`);
        return;
      }

      if (j.request) {
        setRequests((prev) => {
          const rest = prev.filter((r) => r.id !== j.request!.id);
          return [j.request!, ...rest];
        });
      }

      setSubmitted(true);
      setFitsysUrl('');
      toast.success('Заявката е изпратена успешно. Скоро нашите програмисти ще синхронизират графиците.');
    } finally {
      setSubmitting(false);
    }
  };

  if (studios.length === 0) {
    return (
      <div className="space-y-6">
        <DashboardPageHeader
          title="Синхронизация с fitsys"
          description="Споделете линк към вашия fitsys профил, за да синхронизираме разписанието в Zenno."
        />
        <div className={`${dashboardCardClass} p-8 text-center text-muted-foreground`}>
          Първо добавете студио, за да заявите синхронизация с fitsys.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Синхронизация с fitsys"
        description="Ако вече ползвате fitsys, споделете линк към профила си — нашият екип ще синхронизира графика в Zenno."
      />

      <div className={`${dashboardCardClass} p-6 sm:p-8`}>
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-foreground">Линк към fitsys</h2>
            <p className="text-sm text-muted-foreground">
              Поставете публичния или административния линк към вашето студио в fitsys. Не е нужно да водите графика на две места.
            </p>
          </div>
        </div>

        {loadingRequests ? (
          <p className="text-sm text-muted-foreground">Зареждане…</p>
        ) : showSuccessState && statusText ? (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="space-y-2">
                <p className="font-medium text-foreground">{statusText}</p>
                {latestRequestForStudio ? (
                  <a
                    href={latestRequestForStudio.fitsysUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                  >
                    {latestRequestForStudio.fitsysUrl}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                ) : null}
                {latestRequestForStudio?.status === 'PENDING' ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => {
                      setSubmitted(false);
                      setFitsysUrl(latestRequestForStudio.fitsysUrl);
                    }}
                  >
                    Промени линка
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-5 max-w-xl">
            <div className="space-y-2">
              <Label htmlFor="fitsys-studio">Студио</Label>
              <Select value={selectedStudio} onValueChange={setSelectedStudio}>
                <SelectTrigger id="fitsys-studio">
                  <SelectValue placeholder="Изберете студио" />
                </SelectTrigger>
                <SelectContent>
                  {studios.map((studio) => (
                    <SelectItem key={studio.id} value={studio.id}>
                      {studio.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fitsys-url">Линк към fitsys</Label>
              <Input
                id="fitsys-url"
                type="url"
                inputMode="url"
                placeholder="https://app.fitsys.bg/..."
                value={fitsysUrl}
                onChange={(e) => setFitsysUrl(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Линкът трябва да сочи към fitsys (напр. app.fitsys.bg).
              </p>
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? 'Изпращане…' : 'Изпрати за синхронизация'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
