import { NextResponse } from 'next/server';
import type { FitsysSyncRequestStatus } from '@prisma/client';
import { jsonError, requireRole } from '@/lib/api-auth';
import { fitsysSyncRequestToDto } from '@/lib/fitsys-sync-request-dto';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const STATUSES: FitsysSyncRequestStatus[] = ['PENDING', 'SYNCED', 'DECLINED'];

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  if (!id) return jsonError('Липсва идентификатор.', 400);

  let body: { status?: string };
  try {
    body = (await req.json()) as { status?: string };
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const status = body.status as FitsysSyncRequestStatus | undefined;
  if (!status || !STATUSES.includes(status)) {
    return jsonError('Очаква се status: PENDING, SYNCED или DECLINED.', 400);
  }

  const existing = await prisma.fitsysSyncRequest.findUnique({ where: { id } });
  if (!existing) return jsonError('Заявката не е намерена.', 404);

  const updated = await prisma.fitsysSyncRequest.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ request: fitsysSyncRequestToDto(updated) });
}
