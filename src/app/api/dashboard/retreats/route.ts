import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { jsonError, listStudioIdsForActor, requireBusinessWriteAccess, requireRole, requireStripeConnectReady } from '@/lib/api-auth';
import { includesOnlinePayment, parsePaymentModeFromBody } from '@/lib/booking-payment-mode';
import { retreatToDto } from '@/lib/public-studio-dto';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';

export const runtime = 'nodejs';

function parseNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (typeof value !== 'string') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseBoolean(value: FormDataEntryValue | null, fallback: boolean): boolean {
  if (typeof value !== 'string') return fallback;
  return value === 'true' || value === '1' || value.toLowerCase() === 'on';
}

async function uploadRetreatImage(file: File, businessId: string, bucket: string): Promise<string> {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : undefined;
  const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
  const objectPath = `retreats/${businessId}/${randomUUID()}${safeExt ? `.${safeExt}` : ''}`;
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(objectPath, fileBuffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (error) {
    throw new Error(`Качването на снимката не успя: ${error.message}`);
  }
  const { data: publicData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
  return publicData.publicUrl;
}

export async function GET(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  const studioId = new URL(request.url).searchParams.get('studioId');
  const filterIds = studioId ? (allowed.has(studioId) ? [studioId] : null) : [...allowed];

  if (studioId && !allowed.has(studioId)) return jsonError('Forbidden', 403);
  if (!filterIds || filterIds.length === 0) return NextResponse.json({ retreats: [] });

  const retreatDelegate = (prisma as unknown as {
    retreat: {
      findMany: (args: {
        where: { studioId: { in: string[] } };
        orderBy: Array<{ createdAt: 'desc' } | { startDate: 'asc' }>;
      }) => Promise<Parameters<typeof retreatToDto>[0][]>;
    };
  }).retreat;
  const retreats = await retreatDelegate.findMany({
    where: { studioId: { in: filterIds } },
    orderBy: [{ createdAt: 'desc' }, { startDate: 'asc' }],
  });
  return NextResponse.json({ retreats: retreats.map(retreatToDto) });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (gate.ok === false) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES;
  if (!bucket) return jsonError('Missing SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES', 500);

  const formData = await request.formData();
  const studioId = String(formData.get('studioId') ?? '').trim();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const startDate = String(formData.get('startDate') ?? '').trim();
  const endDate = String(formData.get('endDate') ?? '').trim();
  const duration = String(formData.get('duration') ?? '').trim();
  const maxCapacityRaw = String(formData.get('maxCapacity') ?? '').trim();
  const priceRaw = String(formData.get('price') ?? '').trim();
  const paymentModeRaw = String(formData.get('paymentMode') ?? '').trim();
  const activities = formData
    .getAll('activities')
    .filter((x): x is string => typeof x === 'string')
    .map((x) => x.trim())
    .filter(Boolean);
  const uniqueActivities = Array.from(new Set(activities));
  const lat = parseNumberOrNull(formData.get('lat'));
  const lng = parseNumberOrNull(formData.get('lng'));
  const isPublished = parseBoolean(formData.get('isPublished'), true);
  const maxCapacity = Number(maxCapacityRaw);
  const price = Number(priceRaw);

  const allowed = new Set(await listStudioIdsForActor(gate.user));
  if (!studioId || !allowed.has(studioId)) return jsonError('Invalid or forbidden studioId', 400);
  if (!title || !description || !address || !startDate || !endDate || !duration) {
    return jsonError('Missing required fields', 400);
  }
  if (uniqueActivities.length === 0) return jsonError('At least one activity is required', 400);
  if (lat == null || lng == null) return jsonError('Missing map coordinates', 400);
  if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) return jsonError('Invalid maxCapacity', 400);
  if (!Number.isFinite(price) || price < 0) return jsonError('Invalid price', 400);

  const paymentModeResult = parsePaymentModeFromBody(paymentModeRaw || undefined, price, 'onsite');
  if (!paymentModeResult.ok) return jsonError(paymentModeResult.error, 400);
  const paymentMode = paymentModeResult.mode;

  if (includesOnlinePayment(paymentMode)) {
    const stripeGate = await requireStripeConnectReady(
      gate.user,
      'Свържете Stripe акаунта си, за да приемате онлайн плащания.',
    );
    if (!stripeGate.ok) return stripeGate.response;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return jsonError('Invalid date range', 400);
  }

  const studio = await prisma.studio.findUnique({
    where: { id: studioId },
    select: { businessId: true },
  });
  if (!studio) return jsonError('Studio not found', 404);

  const imageFiles = formData.getAll('images').filter((x): x is File => typeof x !== 'string');
  const images = await Promise.all(imageFiles.filter(file => Boolean(file?.name)).map(file => uploadRetreatImage(file, studio.businessId, bucket)));

  const retreatDelegate = (prisma as unknown as {
    retreat: {
      create: (args: {
        data: {
          studioId: string;
          title: string;
          description: string;
          activities: string[];
          images: string[];
          address: string;
          lat: number;
          lng: number;
          startDate: Date;
          endDate: Date;
          duration: string;
          maxCapacity: number;
          enrolled: number;
          price: number;
          paymentMode: typeof paymentMode;
          isPublished: boolean;
          isHidden: boolean;
        };
      }) => Promise<Parameters<typeof retreatToDto>[0]>;
    };
  }).retreat;
  const created = await retreatDelegate.create({
    data: {
      studioId,
      title,
      description,
      activities: uniqueActivities,
      images,
      address,
      lat,
      lng,
      startDate: start,
      endDate: end,
      duration,
      maxCapacity,
      enrolled: 0,
      price,
      paymentMode,
      isPublished,
      isHidden: false,
    },
  });
  invalidateAfterCatalogChange(created.id);
  return NextResponse.json({ retreat: retreatToDto(created) }, { status: 201 });
}
