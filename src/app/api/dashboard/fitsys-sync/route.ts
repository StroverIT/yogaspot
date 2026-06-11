import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  assertStudioWriteAccess,
  jsonError,
  listStudioIdsForActor,
  requireBusinessWriteAccess,
  requireRole,
} from '@/lib/api-auth';
import { fitsysSyncRequestToDto, parseFitsysUrl } from '@/lib/fitsys-sync-request-dto';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  if (allowed.size === 0) return NextResponse.json({ requests: [] });

  const requests = await prisma.fitsysSyncRequest.findMany({
    where: { studioId: { in: [...allowed] } },
    orderBy: [{ createdAt: 'desc' }],
  });

  return NextResponse.json({ requests: requests.map(fitsysSyncRequestToDto) });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const body = (await request.json().catch(() => null)) as { studioId?: string; fitsysUrl?: string } | null;
  const studioId = String(body?.studioId ?? '').trim();
  const fitsysUrl = parseFitsysUrl(String(body?.fitsysUrl ?? ''));

  if (!studioId) return jsonError('Изберете студио.', 400);
  if (!fitsysUrl) {
    return jsonError('Въведете валиден линк към fitsys (напр. https://app.fitsys.bg/...).', 400);
  }

  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  const existingPending = await prisma.fitsysSyncRequest.findFirst({
    where: { studioId, status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
  });

  const saved = existingPending
    ? await prisma.fitsysSyncRequest.update({
        where: { id: existingPending.id },
        data: { fitsysUrl },
      })
    : await prisma.fitsysSyncRequest.create({
        data: { studioId, fitsysUrl },
      });

  return NextResponse.json({ request: fitsysSyncRequestToDto(saved) });
}
