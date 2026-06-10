import { NextResponse } from 'next/server';
import {
  assertStudioWriteAccess,
  jsonError,
  requireBusinessWriteAccess,
  requireRole,
  requireStripeReadyForSubscriptions,
} from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { subscriptionToDto } from '@/lib/public-studio-dto';
import { buildSubscriptionNoteFromRequest } from '@/lib/subscription-request-dto';
import { getConnectAccountIdForStudio, syncStudioSubscriptionStripeCatalog } from '@/lib/stripe-catalog';

export const runtime = 'nodejs';

const ALLOWED_DURATION_MONTHS = [1, 3, 6, 12] as const;

type PutBody = {
  name?: string;
  monthlyPrice?: unknown;
  includes?: string;
  durationMonths?: unknown;
};

function parseDurationMonths(value: unknown): number | null {
  const n =
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  if (!Number.isFinite(n)) return null;
  return (ALLOWED_DURATION_MONTHS as readonly number[]).includes(n) ? n : null;
}

function parsePrice(value: unknown): number | null {
  const n =
    typeof value === 'number' && Number.isFinite(value)
      ? value
      : typeof value === 'string' && value.trim() !== ''
        ? Number(value)
        : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

type RouteContext = { params: Promise<{ studioId: string }> };

export async function GET(_req: Request, context: RouteContext) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { studioId } = await context.params;
  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  const sub = await prisma.studioSubscription.findUnique({ where: { studioId } });
  return NextResponse.json({ subscription: sub ? subscriptionToDto(sub) : null });
}

export async function PUT(req: Request, context: RouteContext) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const stripeGate = await requireStripeReadyForSubscriptions(gate.user);
  if (!stripeGate.ok) return stripeGate.response;

  const { studioId } = await context.params;
  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  let body: PutBody;
  try {
    body = (await req.json()) as PutBody;
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const includes = typeof body.includes === 'string' ? body.includes.trim() : '';
  const monthlyPrice = parsePrice(body.monthlyPrice);
  const durationMonths = parseDurationMonths(body.durationMonths ?? 1);

  if (!name || !includes || monthlyPrice === null || durationMonths === null) {
    return jsonError(
      'Невалидни данни: име, цена > 0, описание и продължителност (1, 3, 6 или 12 месеца) са задължителни.',
      400,
    );
  }

  const subscriptionNote = buildSubscriptionNoteFromRequest(name, includes);
  const existing = await prisma.studioSubscription.findUnique({ where: { studioId } });

  let stripeProductId: string | null = existing?.stripeProductId ?? null;
  let stripePriceId: string | null = existing?.stripePriceId ?? null;

  const connectAccountId = await getConnectAccountIdForStudio(studioId);
  if (!connectAccountId) {
    return NextResponse.json(
      {
        error: 'Свържете Stripe акаунта си, за да създавате абонаменти.',
        code: 'stripe_not_connected',
      },
      { status: 403 },
    );
  }

  const catalogUnchanged =
    Boolean(existing?.stripePriceId) &&
    existing?.monthlyPrice === monthlyPrice &&
    existing?.durationMonths === durationMonths;

  if (catalogUnchanged && existing?.stripePriceId) {
    stripeProductId = existing.stripeProductId;
    stripePriceId = existing.stripePriceId;
  } else {
    try {
      const catalog = await syncStudioSubscriptionStripeCatalog({
        name,
        baseAmount: monthlyPrice,
        durationMonths,
        studioId,
        studioSubscriptionId: existing?.id ?? studioId,
        stripeAccountId: connectAccountId,
        existingProductId: existing?.stripeProductId,
        existingPriceId: existing?.stripePriceId,
      });
      stripeProductId = catalog.productId;
      stripePriceId = catalog.priceId;
    } catch (error) {
      console.error('Stripe catalog sync failed for studio subscription', studioId, error);
      return jsonError('Неуспешно създаване на Stripe продукт/цена. Опитайте отново.', 502);
    }
  }

  const saved = await prisma.studioSubscription.upsert({
    where: { studioId },
    create: {
      studioId,
      hasMonthlySubscription: true,
      name,
      monthlyPrice,
      includes,
      durationMonths,
      subscriptionNote,
      stripeProductId,
      stripePriceId,
    },
    update: {
      hasMonthlySubscription: true,
      name,
      monthlyPrice,
      includes,
      durationMonths,
      subscriptionNote,
      stripeProductId,
      stripePriceId,
    },
  });

  return NextResponse.json({ subscription: subscriptionToDto(saved) });
}

export async function DELETE(_req: Request, context: RouteContext) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { studioId } = await context.params;
  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  const existing = await prisma.studioSubscription.findUnique({ where: { studioId } });
  if (!existing) {
    return NextResponse.json({ subscription: null });
  }

  const saved = await prisma.studioSubscription.update({
    where: { studioId },
    data: {
      hasMonthlySubscription: false,
      name: null,
      monthlyPrice: null,
      includes: null,
      durationMonths: 1,
      subscriptionNote: null,
      stripeProductId: null,
      stripePriceId: null,
    },
  });

  return NextResponse.json({ subscription: subscriptionToDto(saved) });
}
