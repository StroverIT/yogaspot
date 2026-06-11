import type { FitsysSyncRequest as PrismaFitsysSyncRequest } from '@prisma/client';

export type FitsysSyncRequestStatus = 'PENDING' | 'SYNCED' | 'DECLINED';

export type FitsysSyncRequestDto = {
  id: string;
  studioId: string;
  fitsysUrl: string;
  status: FitsysSyncRequestStatus;
  createdAt: string;
  updatedAt: string;
};

export function fitsysSyncRequestToDto(r: PrismaFitsysSyncRequest): FitsysSyncRequestDto {
  return {
    id: r.id,
    studioId: r.studioId,
    fitsysUrl: r.fitsysUrl,
    status: r.status as FitsysSyncRequestStatus,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export const FITSYS_URL_PLACEHOLDER = 'https://studio.{името на студиото}.com/calendar/public';

/** Public calendar links from fitsys use studio.{domain}/calendar/... */
export function isFitsysCalendarHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return host.startsWith('studio.') || host.includes('fitsys');
}

export function parseFitsysUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (!isFitsysCalendarHost(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
