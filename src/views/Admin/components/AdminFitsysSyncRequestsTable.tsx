'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { ExternalLink } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminFitsysSyncRequestListItem } from '@/lib/admin-queries';
import type { FitsysSyncRequestStatus } from '@/lib/fitsys-sync-request-dto';

const STATUS_LABELS: Record<FitsysSyncRequestStatus, string> = {
  PENDING: 'Изчаква',
  SYNCED: 'Синхронизирано',
  DECLINED: 'Отказано',
};

const STATUS_VARIANT: Record<FitsysSyncRequestStatus, 'secondary' | 'default' | 'destructive'> = {
  PENDING: 'secondary',
  SYNCED: 'default',
  DECLINED: 'destructive',
};

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString('bg-BG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminFitsysSyncRequestsTable({
  requests: initialRequests,
}: {
  requests: AdminFitsysSyncRequestListItem[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const updateStatus = async (id: string, status: FitsysSyncRequestStatus) => {
    const previous = requests.find((r) => r.id === id);
    if (!previous || previous.status === status) return;

    setUpdatingId(id);
    setRequests((rows) => rows.map((r) => (r.id === id ? { ...r, status } : r)));

    try {
      const res = await fetch(`/api/admin/fitsys-sync/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; request?: AdminFitsysSyncRequestListItem };
      if (!res.ok) {
        setRequests((rows) => rows.map((r) => (r.id === id ? previous : r)));
        toast.error(typeof j.error === 'string' ? j.error : `Грешка (${res.status})`);
        return;
      }
      if (j.request) {
        setRequests((rows) =>
          rows.map((r) => (r.id === id ? { ...r, ...j.request!, studioName: r.studioName } : r)),
        );
      }
      toast.success('Статусът е обновен.');
    } catch {
      setRequests((rows) => rows.map((r) => (r.id === id ? previous : r)));
      toast.error('Неуспешно обновяване на статуса.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <Card className="rounded-2xl border-border/80 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">fitsys синхронизация</CardTitle>
        <p className="text-sm text-muted-foreground">
          Всички заявени линкове към fitsys календари със студио, статус и възможност за промяна.
        </p>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Няма заявки за fitsys синхронизация.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Studio ID</th>
                  <th className="pb-3 pr-4 font-medium">Студио</th>
                  <th className="pb-3 pr-4 font-medium">fitsys линк</th>
                  <th className="pb-3 pr-4 font-medium">Статус</th>
                  <th className="pb-3 font-medium">Изпратено</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {requests.map((req) => (
                  <tr key={req.id} className="align-top">
                    <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">{req.studioId}</td>
                    <td className="py-4 pr-4 font-medium text-foreground">{req.studioName}</td>
                    <td className="py-4 pr-4 max-w-xs">
                      <a
                        href={req.fitsysUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-1.5 text-primary hover:underline break-all"
                      >
                        <span>{req.fitsysUrl}</span>
                        <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      </a>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex flex-col gap-2">
                        <Badge variant={STATUS_VARIANT[req.status]}>{STATUS_LABELS[req.status]}</Badge>
                        <Select
                          value={req.status}
                          disabled={updatingId === req.id}
                          onValueChange={(value) => void updateStatus(req.id, value as FitsysSyncRequestStatus)}
                        >
                          <SelectTrigger className="h-9 w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(STATUS_LABELS) as FitsysSyncRequestStatus[]).map((status) => (
                              <SelectItem key={status} value={status}>
                                {STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground whitespace-nowrap">{formatWhen(req.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
