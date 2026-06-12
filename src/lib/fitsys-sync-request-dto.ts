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

export const FITSYS_URL_PLACEHOLDER = 'https://...';

export function parseFitsysUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
  } catch {
    // fall through - accept any non-empty string below
  }

  return trimmed;
}
