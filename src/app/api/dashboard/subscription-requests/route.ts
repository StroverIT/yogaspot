import { NextResponse } from 'next/server';
import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { isOnlinePaymentsEnabled } from '@/lib/payment-settings';
import { subscriptionRequestToDto } from '@/lib/subscription-request-dto';
import { ensureStripeCatalogEntry } from '@/lib/stripe-catalog';

export const runtime = 'nodejs';

type PostBody = {
  studioId?: string;
  name?: string;
  monthlyPrice?: unknown;
  includes?: string;
};

export async function POST(req: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  let body: PostBody;
  try {
    body = (await req.json()) as PostBody;
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const studioId = typeof body.studioId === 'string' ? body.studioId.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const includes = typeof body.includes === 'string' ? body.includes.trim() : '';
  const monthlyPrice =
    typeof body.monthlyPrice === 'number' && Number.isFinite(body.monthlyPrice)
      ? body.monthlyPrice
      : typeof body.monthlyPrice === 'string' && body.monthlyPrice.trim() !== ''
        ? Number(body.monthlyPrice)
        : NaN;

  if (!studioId || !name || !includes || !Number.isFinite(monthlyPrice) || monthlyPrice <= 0) {
    return jsonError('Невалидни данни: студио, име, цена > 0 и описание са задължителни.', 400);
  }

  const access = await assertStudioWriteAccess(gate.user, studioId);
  if (!access.ok) return access.response;

  const [studioSub, pending] = await Promise.all([
    prisma.studioSubscription.findUnique({ where: { studioId } }),
    prisma.subscriptionRequest.findFirst({
      where: { studioId, status: 'PENDING' },
      select: { id: true },
    }),
  ]);

  if (studioSub?.hasMonthlySubscription) {
    return jsonError('Студиото вече има активен месечен абонамент.', 409);
  }
  if (pending) {
    return jsonError('Вече има изчакваща заявка за това студио.', 409);
  }

  const created = await prisma.subscriptionRequest.create({
    data: {
      studioId,
      name,
      monthlyPrice,
      includes,
      status: 'PENDING',
    },
  });

  if (isOnlinePaymentsEnabled()) {
    try {
      await ensureStripeCatalogEntry({
        name: `Subscription: ${created.name}`,
        baseAmount: created.monthlyPrice,
        recurringInterval: 'month',
        metadata: {
          type: 'subscription',
          subscriptionRequestId: created.id,
          studioId: created.studioId,
        },
      });
    } catch (error) {
      console.error('Stripe catalog sync failed for subscription request', created.id, error);
    }
  }

  return NextResponse.json({ request: subscriptionRequestToDto(created) }, { status: 201 });
}
