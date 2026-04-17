import { NextResponse } from 'next/server';

import { jsonError, requireRole } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;

  let body: { isHidden?: boolean };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  if (typeof body.isHidden !== 'boolean') {
    return jsonError('Invalid isHidden flag', 400);
  }

  const existing = await prisma.studio.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return jsonError('Studio not found', 404);

  const studio = await prisma.studio.update({
    where: { id },
    data: { isHidden: body.isHidden },
    select: { id: true, isHidden: true },
  });

  return NextResponse.json({ studio });
}
