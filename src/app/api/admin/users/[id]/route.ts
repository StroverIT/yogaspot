import { NextResponse } from 'next/server';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { jsonError, requireRole } from '@/lib/api-auth';

export const runtime = 'nodejs';

const ROLES: Role[] = ['client', 'business', 'admin'];

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const role = body.role as Role | undefined;
  if (!role || !ROLES.includes(role)) {
    return jsonError('Invalid role', 400);
  }

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return jsonError('Not found', 404);
  }

  if (existing.role === 'admin' && role !== 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } });
    if (adminCount <= 1) {
      return jsonError('Cannot demote the last admin', 400);
    }
  }

  const updated = await prisma.user.update({
    where: { id },
    data: { role },
    select: { id: true, name: true, email: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
