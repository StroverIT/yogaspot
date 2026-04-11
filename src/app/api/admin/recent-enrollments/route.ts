import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const rows = await prisma.recentEnrollment.findMany({
    orderBy: { enrolledAt: 'desc' },
    take: 30,
  });

  return NextResponse.json({
    enrollments: rows.map((r) => ({
      id: r.id,
      userName: r.userDisplayName,
      className: r.className,
      studioName: r.studioName,
      enrolledAt: r.enrolledAt.toISOString(),
    })),
  });
}
