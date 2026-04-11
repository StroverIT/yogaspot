import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
  amenitiesParking?: boolean;
  amenitiesShower?: boolean;
  amenitiesChangingRoom?: boolean;
  amenitiesEquipmentRental?: boolean;
};

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
