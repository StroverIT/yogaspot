import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';

export const runtime = 'nodejs';

type SessionUser = {
  id?: string;
  role?: 'client' | 'business' | 'admin';
};

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
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (sessionUser.role !== 'business' && sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const business =
    (await prisma.business.findUnique({ where: { ownerUserId: sessionUser.id } })) ??
    (sessionUser.role === 'admin'
      ? await prisma.business.findFirst()
      : null);

  if (!business) {
    return NextResponse.json({ studios: [] });
  }

  const studios = await prisma.studio.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' },
  });

  // Keep API response compatible with existing UI expectations.
  return NextResponse.json({
    studios: studios.map((s) => ({
      id: s.id,
      name: s.name,
      address: s.address,
      lat: s.lat ?? 0,
      lng: s.lng ?? 0,
      images: s.images ?? [],
      description: s.description,
      phone: s.phone,
      email: s.email,
      rating: s.rating ?? 0,
      reviewCount: s.reviewCount ?? 0,
      businessId: s.businessId,
      amenities: {
        parking: s.amenitiesParking,
        shower: s.amenitiesShower,
        changingRoom: s.amenitiesChangingRoom,
        equipmentRental: s.amenitiesEquipmentRental,
      },
      yogaTypes: s.yogaTypes ?? [],
    })),
  });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as SessionUser | undefined;

  if (!sessionUser?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (sessionUser.role !== 'business' && sessionUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

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

  const ownerUserId = sessionUser.id as string;

  const business =
    (await prisma.business.findUnique({ where: { ownerUserId } })) ??
    (await prisma.business.create({ data: { ownerUserId } }));

  const imageFiles = formData
    .getAll('images')
    .filter((v): v is File => typeof v !== 'string');

  const imageUrls: string[] = [];
  for (const file of imageFiles) {
    // Next.js provides uploaded files as `File` in formData.
    if (!file?.name) continue;

    const originalName = String(file.name);
    const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined;
    const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
    const objectPath = `studios/${business.id}/${randomUUID()}${safeExt ? `.${safeExt}` : ''}`;

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(objectPath, file, {
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

  return NextResponse.json({
    studio: {
      id: created.id,
      name: created.name,
      address: created.address,
      lat: created.lat ?? 0,
      lng: created.lng ?? 0,
      images: created.images ?? [],
      description: created.description,
      phone: created.phone,
      email: created.email,
      rating: created.rating ?? 0,
      reviewCount: created.reviewCount ?? 0,
      businessId: created.businessId,
      amenities: {
        parking: created.amenitiesParking,
        shower: created.amenitiesShower,
        changingRoom: created.amenitiesChangingRoom,
        equipmentRental: created.amenitiesEquipmentRental,
      },
      yogaTypes: created.yogaTypes ?? [],
    },
  });
}

