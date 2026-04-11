import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
    orderBy: { email: 'asc' },
  });

  return NextResponse.json({ users });
}
