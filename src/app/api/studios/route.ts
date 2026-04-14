import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';
import { requireRole } from '@/lib/api-auth';
import { getDashboardStudiosListForUser, mapStudioResponse } from '@/lib/dashboard-studios-data';
import { trackServerEvent } from '@/lib/server-analytics';

export const runtime = 'nodejs';

function toBoolean(value: FormDataEntryValue | null): boolean {
  if (value == null) return false;
  if (typeof value === 'string') return value === 'true' || value === '1' || value.toLowerCase() === 'on';
  return false;
}

function parseNumberOrNull(value: FormDataEntryValue | null): number | null {
  if (value == null) return null;
  if (typeof value !== 'string') return null;
  if (!value.trim()) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function GET() {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const studios = await getDashboardStudiosListForUser(gate.user);
  return NextResponse.json({ studios });
}

export async function POST(request: Request) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const bucket = process.env.SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES;
  if (!bucket) {
    return NextResponse.json({ error: 'Missing SUPABASE_STORAGE_BUCKET_STUDIO_IMAGES' }, { status: 500 });
  }

  const formData = await request.formData();

  const name = String(formData.get('name') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();

  const lat = parseNumberOrNull(formData.get('lat'));
  const lng = parseNumberOrNull(formData.get('lng'));

  const amenitiesParking = toBoolean(formData.get('amenitiesParking'));
  const amenitiesShower = toBoolean(formData.get('amenitiesShower'));
  const amenitiesChangingRoom = toBoolean(formData.get('amenitiesChangingRoom'));
  const amenitiesEquipmentRental = toBoolean(formData.get('amenitiesEquipmentRental'));

  const yogaTypes = formData.getAll('yogaTypes').filter((v): v is string => typeof v === 'string' && !!v);
  const uniqueYogaTypes = Array.from(new Set(yogaTypes));

  if (!name || !address || !description) {
    const missing = [(!name && 'име'), (!address && 'адрес'), (!description && 'описание')].filter(Boolean).join(', ');
    const error = `Липсват задължителни полета: ${missing}.`;
    if (process.env.NODE_ENV === 'development') console.error('[POST /api/studios] Validation:', error);
    return NextResponse.json({ error }, { status: 400 });
  }

  if (!phone || !email) {
    const missing = [(!phone && 'телефон'), (!email && 'имейл')].filter(Boolean).join(', ');
    const error = `Липсват задължителни полета: ${missing}.`;
    if (process.env.NODE_ENV === 'development') console.error('[POST /api/studios] Validation:', error);
    return NextResponse.json({ error }, { status: 400 });
  }

  const ownerUserId = gate.user.id;
  const owner = await prisma.user.findUnique({ where: { id: ownerUserId } });
  if (!owner) {
    return NextResponse.json(
      { error: 'Профилът не е намерен в базата. Моля, излезте и влезте отново.' },
      { status: 401 },
    );
  }

  const business =
    (await prisma.business.findUnique({ where: { ownerUserId } })) ??
    (await prisma.business.create({ data: { ownerUserId } }));

  const imageFiles = formData
    .getAll('images')
    .filter((v): v is File => typeof v !== 'string');

  if (process.env.NODE_ENV === 'development') {
    console.log('[POST /api/studios] imageFiles:', imageFiles.length);
  }

  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    // Next.js provides uploaded files as `File` in formData.
    if (!file?.name) continue;

    const originalName = String(file.name);
    const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
    const objectPath = `studios/${business.id}/${randomUUID()}${safeExt ? `.${safeExt}` : ''}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, fileBuffer, {
        contentType: file.type ?? 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      const message = `Качването на снимката не успя: ${uploadError.message}. Уверете се, че bucket „${bucket}" съществува в Supabase Storage и е публичен.`;
      if (process.env.NODE_ENV === 'development') {
        console.error('[POST /api/studios] Storage upload error:', uploadError);
      }
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadData.path);
    imageUrls.push(publicUrlData.publicUrl);
  }

  const created = await prisma.studio.create({
    data: {
      businessId: business.id,
      name,
      address,
      lat,
      lng,
      description,
      phone,
      email,
      images: imageUrls,
      amenitiesParking,
      amenitiesShower,
      amenitiesChangingRoom,
      amenitiesEquipmentRental,
      yogaTypes: uniqueYogaTypes,
    },
  });

  await trackServerEvent({
    eventName: 'studio_profile_completed',
    userId: gate.user.id,
    studioId: created.id,
    metadata: {
      businessId: business.id,
      hasImages: created.images.length > 0,
    },
  });

  return NextResponse.json({
    studio: mapStudioResponse(created),
  });
}

