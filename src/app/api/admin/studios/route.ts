import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';
import { studioToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      business: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });

  return NextResponse.json({
    studios: studios.map((s) => ({
      ...studioToDto(s),
      ownerUserId: s.business.ownerUserId,
      ownerName: s.business.owner.name,
      ownerEmail: s.business.owner.email,
    })),
  });
}
