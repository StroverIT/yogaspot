import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  getBusinessForUser,
  jsonError,
  listStudioIdsForActor,
  requireBusinessWriteAccess,
  requireRole,
} from '@/lib/api-auth';
import { instructorToDto } from '@/lib/public-studio-dto';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';
import {
  createOnlineStudioForInstructor,
  ensureBusinessForOwnerUserId,
  syncOnlineStudioFromInstructor,
} from '@/lib/online-instructor-studio';
import { isValidZoomMeetingUrl, teachingModeToPrisma } from '@/lib/teaching-mode';

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

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));

  let body: {
    studioId?: string;
    teachingMode?: string;
    zoomMeetingUrl?: string;
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

  if (!body.name?.trim() || !body.bio?.trim() || !body.experienceLevel?.trim()) {
    return jsonError('Missing name, bio, or experienceLevel', 400);
  }

  const isOnlineCreate = teachingModeToPrisma(body.teachingMode) === 'ONLINE';
  let studioId = body.studioId?.trim() ?? '';

  if (isOnlineCreate && !studioId) {
    const zoom = body.zoomMeetingUrl?.trim() ?? '';
    if (!isValidZoomMeetingUrl(zoom)) {
      return jsonError('Добавете валиден Zoom линк за онлайн профил.', 400);
    }

    const owner = await prisma.user.findUnique({
      where: { id: gate.user.id },
      select: { email: true },
    });
    const contactEmail = owner?.email?.trim() || 'contact@zenno.app';

    let businessId: string;
    if (gate.user.role === 'admin') {
      const business = await prisma.business.findFirst({ select: { id: true } });
      if (!business) return jsonError('No business account', 400);
      businessId = business.id;
    } else {
      const business = await getBusinessForUser(gate.user.id);
      const resolved = business ?? (await ensureBusinessForOwnerUserId(gate.user.id));
      businessId = resolved.id;
    }

    const studio = await createOnlineStudioForInstructor({
      businessId,
      instructorName: body.name.trim(),
      bio: body.bio.trim(),
      zoomMeetingUrl: zoom,
      yogaStyles: Array.isArray(body.yogaStyle)
        ? body.yogaStyle.filter((x) => typeof x === 'string')
        : [],
      contactEmail,
      photoUrl: typeof body.photo === 'string' ? body.photo : undefined,
    });
    studioId = studio.id;
    allowed.add(studioId);
  }

  if (!studioId || !allowed.has(studioId)) {
    return jsonError('Invalid or forbidden studioId', 400);
  }
  if (!isOnlineCreate && !body.studioId) {
    return jsonError('Изберете студио за инструктор в зала.', 400);
  }

  const yogaStyles = Array.isArray(body.yogaStyle)
    ? body.yogaStyle.filter((x) => typeof x === 'string')
    : [];

  const created = await prisma.instructor.create({
    data: {
      studioId,
      name: body.name.trim(),
      photo: typeof body.photo === 'string' ? body.photo : '',
      bio: body.bio.trim(),
      yogaStyle: yogaStyles,
      experienceLevel: body.experienceLevel.trim(),
      rating: typeof body.rating === 'number' && Number.isFinite(body.rating) ? body.rating : 0,
    },
  });

  if (isOnlineCreate) {
    await syncOnlineStudioFromInstructor({
      studioId,
      instructorName: created.name,
      bio: created.bio,
      zoomMeetingUrl: body.zoomMeetingUrl,
      yogaStyles,
      photoUrl: created.photo,
    });
  }

  invalidateAfterCatalogChange();
  return NextResponse.json({ instructor: instructorToDto(created) }, { status: 201 });
}
