import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertStudioWriteAccess, jsonError, requireBusinessWriteAccess, requireRole } from '@/lib/api-auth';
import { retreatToDto } from '@/lib/public-studio-dto';
import { invalidateAfterCatalogChange } from '@/lib/app-revalidate';

export const runtime = 'nodejs';

const NEW_IMAGE_SLOT_MARKER = '__NEW__';

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

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await ctx.params;
  const existing = await prisma.retreat.findUnique({
    where: { id },
    select: { id: true, studioId: true, images: true, studio: { select: { businessId: true } } },
  });
  if (!existing) return jsonError('Not found', 404);

  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES;
  if (!bucket) return jsonError('Missing SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES', 500);

  const formData = await request.formData();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const startDate = String(formData.get('startDate') ?? '').trim();
  const endDate = String(formData.get('endDate') ?? '').trim();
  const duration = String(formData.get('duration') ?? '').trim();
  const maxCapacityRaw = String(formData.get('maxCapacity') ?? '').trim();
  const priceRaw = String(formData.get('price') ?? '').trim();
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

  if (!title || !description || !address || !startDate || !endDate || !duration) {
    return jsonError('Missing required fields', 400);
  }
  if (uniqueActivities.length === 0) return jsonError('At least one activity is required', 400);
  if (lat == null || lng == null) return jsonError('Missing map coordinates', 400);
  if (!Number.isFinite(maxCapacity) || maxCapacity <= 0) return jsonError('Invalid maxCapacity', 400);
  if (!Number.isFinite(price) || price < 0) return jsonError('Invalid price', 400);

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    return jsonError('Invalid date range', 400);
  }

  const imageFiles = formData.getAll('images').filter((x): x is File => typeof x !== 'string');
  const imageSlots = formData.getAll('imageSlot').filter((x): x is string => typeof x === 'string');
  const allowedExisting = new Set(existing.images ?? []);
  const images: string[] = [];
  let fileIndex = 0;
  for (const slot of imageSlots) {
    if (slot === NEW_IMAGE_SLOT_MARKER) {
      const nextFile = imageFiles[fileIndex++];
      if (!nextFile?.name) return jsonError('Missing new image file for slot', 400);
      const uploaded = await uploadRetreatImage(nextFile, existing.studio.businessId, bucket);
      images.push(uploaded);
      continue;
    }
    const trimmed = slot.trim();
    if (!trimmed) continue;
    if (!allowedExisting.has(trimmed)) return jsonError('Invalid existing image url', 400);
    images.push(trimmed);
  }

  if (fileIndex !== imageFiles.length) return jsonError('Image slots mismatch', 400);

  const updated = await prisma.retreat.update({
    where: { id },
    data: {
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
      price,
      isPublished,
    },
  });

  invalidateAfterCatalogChange(updated.id);
  return NextResponse.json({ retreat: retreatToDto(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const writeGate = await requireBusinessWriteAccess(gate.user);
  if (!writeGate.ok) return writeGate.response;

  const { id } = await ctx.params;
  const existing = await prisma.retreat.findUnique({ where: { id }, select: { studioId: true } });
  if (!existing) return jsonError('Not found', 404);
  const access = await assertStudioWriteAccess(gate.user, existing.studioId);
  if (!access.ok) return access.response;

  await prisma.retreat.delete({ where: { id } });
  invalidateAfterCatalogChange(id);
  return NextResponse.json({ ok: true });
}
