import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';
import { reviewToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function GET() {
  const gate = await requireRole('admin');
  if (!gate.ok) return gate.response;

  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 200,
  });

  return NextResponse.json({ reviews: reviews.map(reviewToDto) });
}
