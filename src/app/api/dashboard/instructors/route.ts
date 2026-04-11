import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jsonError, listStudioIdsForActor, requireRole } from '@/lib/api-auth';
import { instructorToDto } from '@/lib/public-studio-dto';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const studioId = new URL(request.url).searchParams.get('studioId');
  const filterIds = studioId ? (allowed.has(studioId) ? [studioId] : null) : [...allowed];
  if (studioId && !allowed.has(studioId)) {
    return jsonError('Forbidden', 403);
  }
  if (!filterIds || filterIds.length === 0) {
    return NextResponse.json({ instructors: [] });
  }

  const instructors = await prisma.instructor.findMany({
    where: { studioId: { in: filterIds } },
    orderBy: { name: 'asc' },
  });

  return NextResponse.json({ instructors: instructors.map(instructorToDto) });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));

  let body: {
    studioId?: string;
    name?: string;
    photo?: string;
    bio?: string;
    yogaStyle?: string[];
    experienceLevel?: string;
    rating?: number;
  };
  try {
    body = await request.json();
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  if (!body.studioId || !allowed.has(body.studioId)) {
    return jsonError('Invalid or forbidden studioId', 400);
  }
  if (!body.name?.trim() || !body.bio?.trim() || !body.experienceLevel?.trim()) {
    return jsonError('Missing name, bio, or experienceLevel', 400);
  }

  const created = await prisma.instructor.create({
    data: {
      studioId: body.studioId,
      name: body.name.trim(),
      photo: typeof body.photo === 'string' ? body.photo : '',
      bio: body.bio.trim(),
      yogaStyle: Array.isArray(body.yogaStyle) ? body.yogaStyle.filter((x) => typeof x === 'string') : [],
      experienceLevel: body.experienceLevel.trim(),
      rating: typeof body.rating === 'number' && Number.isFinite(body.rating) ? body.rating : 0,
    },
  });

  return NextResponse.json({ instructor: instructorToDto(created) }, { status: 201 });
}
