import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import {
  evaluateAndPersistAccess,
  getSubscriptionForOwnerUserId,
  isPlatformAccessBlocked,
} from '@/lib/business-platform-billing';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';

export type SessionUser = {
  id?: string;
  role?: Role;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user as SessionUser | undefined;
  if (!u?.id) return null;
  return u;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireSession(): Promise<
  { ok: true; user: SessionUser & { id: string } } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user?.id) {
    return { ok: false, response: jsonError('Unauthorized', 401) };
  }
  return { ok: true, user: user as SessionUser & { id: string } };
}

export async function requireRole(
  allowed: Role | Role[],
): Promise<
  | { ok: true; user: SessionUser & { id: string; role: Role } }
  | { ok: false; response: NextResponse }
> {
  const gate = await requireSession();
  if (!gate.ok) return gate;
  const role = gate.user.role;
  if (!role) {
    return { ok: false, response: jsonError('Forbidden', 403) };
  }
  const list = Array.isArray(allowed) ? allowed : [allowed];
  if (!list.includes(role)) {
    return { ok: false, response: jsonError('Forbidden', 403) };
  }
  return { ok: true, user: gate.user as SessionUser & { id: string; role: Role } };
}

export async function getBusinessForUser(userId: string) {
  return prisma.business.findUnique({ where: { ownerUserId: userId } });
}

/** Business owner of this studio, or null if missing */
export async function getStudioBusinessOwnerUserId(studioId: string): Promise<string | null> {
  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { business: { select: { ownerUserId: true } } },
  });
  return studio?.business.ownerUserId ?? null;
}

export async function assertStudioWriteAccess(
  user: SessionUser & { id: string; role: Role },
  studioId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (user.role === 'admin') return { ok: true };
  if (user.role !== 'business') {
    return { ok: false, response: jsonError('Forbidden', 403) };
  }
  const ownerId = await getStudioBusinessOwnerUserId(studioId);
  if (!ownerId || ownerId !== user.id) {
    return { ok: false, response: jsonError('Forbidden', 403) };
  }
  return { ok: true };
}

export async function assertStudioReadAccess(
  user: SessionUser & { id: string; role: Role },
  studioId: string,
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  return assertStudioWriteAccess(user, studioId);
}

/** Studio IDs the actor may manage or read in dashboard APIs. */
export async function listStudioIdsForActor(user: SessionUser & { id: string; role: Role }): Promise<string[]> {
  if (user.role === 'admin') {
    const rows = await prisma.studio.findMany({ select: { id: true } });
    return rows.map((r) => r.id);
  }
  if (user.role !== 'business') return [];
  const biz = await prisma.business.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true },
  });
  if (!biz) return [];
  const rows = await prisma.studio.findMany({
    where: { businessId: biz.id },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

/** Blocks dashboard writes when the business platform subscription is past grace period. */
export async function requireActivePlatformSubscription(
  user: SessionUser & { id: string; role: Role },
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (user.role === 'admin') return { ok: true };
  if (user.role !== 'business') return { ok: true };

  const biz = await prisma.business.findUnique({
    where: { ownerUserId: user.id },
    select: { id: true },
  });
  if (!biz) return { ok: true };

  const sub = await getSubscriptionForOwnerUserId(user.id);
  if (!sub) return { ok: true };

  const evaluated = await evaluateAndPersistAccess(sub);
  if (isPlatformAccessBlocked(evaluated.status)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Акаунтът е блокиран поради неплатена фактура. Моля, платете абонамента си.',
          code: 'platform_payment_required',
        },
        { status: 402 },
      ),
    };
  }
  return { ok: true };
}

export async function requireBusinessWriteAccess(
  user: SessionUser & { id: string; role: Role },
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const subGate = await requireActivePlatformSubscription(user);
  if (!subGate.ok) return subGate;
  return { ok: true };
}

/** Requires Stripe customer on platform billing before studio subscription CRUD. */
export async function requireStripeReadyForSubscriptions(
  user: SessionUser & { id: string; role: Role },
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  if (user.role === 'admin') return { ok: true };
  if (!isOnlinePaymentsEnabled()) return { ok: true };

  const sub = await getSubscriptionForOwnerUserId(user.id);
  if (!sub?.stripeCustomerId) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: 'Свържете Stripe акаунта си, за да създавате абонаменти.',
          code: 'stripe_not_connected',
        },
        { status: 403 },
      ),
    };
  }
  return { ok: true };
}
