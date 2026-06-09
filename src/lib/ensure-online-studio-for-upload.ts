import type { Role } from '@prisma/client';
import type { SessionUser } from '@/lib/api-auth';
import { getBusinessForUser } from '@/lib/api-auth';
import {
  createOnlineStudioForInstructor,
  ensureBusinessForOwnerUserId,
} from '@/lib/online-instructor-studio';
import { isValidZoomMeetingUrl } from '@/lib/teaching-mode';
import { prisma } from '@/lib/prisma';

/** Provisions an online studio for photo upload before instructor is saved. */
export async function ensureOnlineStudioForUpload(
  user: SessionUser & { id: string; role: Role },
  params: { instructorName: string; zoomMeetingUrl: string },
): Promise<{ ok: true; studioId: string } | { ok: false; error: string }> {
  if (!params.instructorName.trim()) {
    return { ok: false, error: 'Въведете име на инструктора.' };
  }
  if (!isValidZoomMeetingUrl(params.zoomMeetingUrl)) {
    return { ok: false, error: 'Въведете валиден Zoom линк.' };
  }

  const owner = await prisma.user.findUnique({
    where: { id: user.id },
    select: { email: true },
  });
  const contactEmail = owner?.email?.trim() || 'contact@zenno.app';

  let businessId: string;
  if (user.role === 'admin') {
    const business = await prisma.business.findFirst({ select: { id: true } });
    if (!business) return { ok: false, error: 'Няма бизнес акаунт.' };
    businessId = business.id;
  } else {
    const business = await getBusinessForUser(user.id);
    const resolved = business ?? (await ensureBusinessForOwnerUserId(user.id));
    businessId = resolved.id;
  }

  const studio = await createOnlineStudioForInstructor({
    businessId,
    instructorName: params.instructorName,
    bio: '',
    zoomMeetingUrl: params.zoomMeetingUrl,
    yogaStyles: [],
    contactEmail,
  });

  return { ok: true, studioId: studio.id };
}
