import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { assertStudioWriteAccess, jsonError, requireRole } from '@/lib/api-auth';

export const runtime = 'nodejs';

type PatchBody = {
  name?: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  website?: string | null;
  lat?: number | null;
  lng?: number | null;
  yogaTypes?: string[];
  images?: string[];
  amenitiesParking?: boolean;
  amenitiesShower?: boolean;
  amenitiesChangingRoom?: boolean;
  amenitiesEquipmentRental?: boolean;
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

const NEW_IMAGE_SLOT_MARKER = '__NEW__';

async function uploadStudioImageFile(
  file: File,
  businessId: string,
  bucket: string,
): Promise<{ ok: true; publicUrl: string } | { ok: false; message: string }> {
  if (!file?.name) {
    return { ok: false, message: 'Невалиден файл за снимка.' };
  }

  const originalName = String(file.name);
  const ext = originalName.includes('.') ? originalName.split('.').pop() : undefined;
  const safeExt = ext ? ext.toLowerCase().replace(/[^a-z0-9]/g, '') : 'bin';
  const objectPath = `studios/${businessId}/${randomUUID()}${safeExt ? `.${safeExt}` : ''}`;

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(objectPath, fileBuffer, {
      contentType: file.type ?? 'application/octet-stream',
      upsert: false,
    });

  if (uploadError) {
    const message = `Качването на снимката не успя: ${uploadError.message}. Уверете се, че bucket „${bucket}" съществува в Supabase Storage и е публичен.`;
    return { ok: false, message };
  }

  const { data: publicUrlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(uploadData.path);
  return { ok: true, publicUrl: publicUrlData.publicUrl };
}

function mapStudioResponse(s: Awaited<ReturnType<typeof prisma.studio.findUnique>>) {
  if (!s) return null;
  return {
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
  };
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const access = await assertStudioWriteAccess(gate.user, id);
  if (!access.ok) return access.response;

  const contentType = request.headers.get('content-type') ?? '';
  if (contentType.includes('multipart/form-data')) {
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

    const existingImageUrls = formData
      .getAll('existingImageUrls')
      .filter((v): v is string => typeof v === 'string' && !!v.trim());

    const imageFiles = formData.getAll('images').filter((v): v is File => typeof v !== 'string');

    const imageOrderMode = String(formData.get('imageOrderMode') ?? '');
    const imageSlotEntries = formData.getAll('imageSlot').filter((v): v is string => typeof v === 'string');

    if (!name || !address || !description) {
      const missing = [(!name && 'име'), (!address && 'адрес'), (!description && 'описание')].filter(Boolean).join(', ');
      return NextResponse.json({ error: `Липсват задължителни полета: ${missing}.` }, { status: 400 });
    }

    if (!phone || !email) {
      const missing = [(!phone && 'телефон'), (!email && 'имейл')].filter(Boolean).join(', ');
      return NextResponse.json({ error: `Липсват задължителни полета: ${missing}.` }, { status: 400 });
    }

    const studioRow = await prisma.studio.findUnique({
      where: { id },
      select: { businessId: true, images: true },
    });
    if (!studioRow) {
      return jsonError('Studio not found', 404);
    }

    let imageUrls: string[];

    if (imageOrderMode === 'slots') {
      const allowedExisting = new Set((studioRow.images ?? []).filter(Boolean));
      let fileIdx = 0;
      imageUrls = [];

      for (const slot of imageSlotEntries) {
        if (slot === NEW_IMAGE_SLOT_MARKER) {
          const file = imageFiles[fileIdx++];
          if (!file?.name) {
            return NextResponse.json({ error: 'Липсва файл за нова снимка.' }, { status: 400 });
          }
          const uploaded = await uploadStudioImageFile(file, studioRow.businessId, bucket);
          if (!uploaded.ok) {
            return NextResponse.json({ error: uploaded.message }, { status: 400 });
          }
          imageUrls.push(uploaded.publicUrl);
        } else {
          const trimmed = slot.trim();
          if (!trimmed) continue;
          if (!allowedExisting.has(trimmed)) {
            return NextResponse.json({ error: 'Невалиден адрес на съществуваща снимка.' }, { status: 400 });
          }
          imageUrls.push(trimmed);
        }
      }

      if (fileIdx !== imageFiles.length) {
        return NextResponse.json({ error: 'Несъответствие между нови снимки и подредба.' }, { status: 400 });
      }
    } else {
      imageUrls = [...existingImageUrls];
      for (const file of imageFiles) {
        if (!file?.name) continue;
        const uploaded = await uploadStudioImageFile(file, studioRow.businessId, bucket);
        if (!uploaded.ok) {
          return NextResponse.json({ error: uploaded.message }, { status: 400 });
        }
        imageUrls.push(uploaded.publicUrl);
      }
    }

    const updated = await prisma.studio.update({
      where: { id },
      data: {
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

    return NextResponse.json({ studio: mapStudioResponse(updated) });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return jsonError('Invalid JSON', 400);
  }

  const data: Record<string, unknown> = {};
  if (typeof body.name === 'string') data.name = body.name.trim();
  if (typeof body.address === 'string') data.address = body.address.trim();
  if (typeof body.description === 'string') data.description = body.description.trim();
  if (typeof body.phone === 'string') data.phone = body.phone.trim();
  if (typeof body.email === 'string') data.email = body.email.trim();
  if (body.website === null || typeof body.website === 'string') data.website = body.website?.trim() || null;
  if (body.lat !== undefined) data.lat = body.lat;
  if (body.lng !== undefined) data.lng = body.lng;
  if (Array.isArray(body.yogaTypes)) data.yogaTypes = body.yogaTypes.filter((x) => typeof x === 'string');
  if (typeof body.amenitiesParking === 'boolean') data.amenitiesParking = body.amenitiesParking;
  if (typeof body.amenitiesShower === 'boolean') data.amenitiesShower = body.amenitiesShower;
  if (typeof body.amenitiesChangingRoom === 'boolean') data.amenitiesChangingRoom = body.amenitiesChangingRoom;
  if (typeof body.amenitiesEquipmentRental === 'boolean') data.amenitiesEquipmentRental = body.amenitiesEquipmentRental;
  if (Array.isArray(body.images)) data.images = body.images.filter((x) => typeof x === 'string');

  if (Object.keys(data).length === 0) {
    return jsonError('No valid fields to update', 400);
  }

  const updated = await prisma.studio.update({
    where: { id },
    data,
  });

  return NextResponse.json({ studio: mapStudioResponse(updated) });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const gate = await requireRole(['business', 'admin']);
  if (!gate.ok) return gate.response;

  const { id } = await ctx.params;
  const access = await assertStudioWriteAccess(gate.user, id);
  if (!access.ok) return access.response;

  await prisma.studio.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
