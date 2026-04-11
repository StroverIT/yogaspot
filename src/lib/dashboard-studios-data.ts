import type { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { SessionUser } from '@/lib/api-auth';

export type DashboardStudioListItem = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  images: string[];
  description: string;
  phone: string;
  email: string;
  amenities: {
    parking: boolean;
    shower: boolean;
    changingRoom: boolean;
    equipmentRental: boolean;
  };
  rating: number;
  reviewCount: number;
  businessId: string;
  yogaTypes: string[];
};

export function mapStudioResponse(s: {
  id: string;
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  images: string[];
  description: string;
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  businessId: string;
  amenitiesParking: boolean;
  amenitiesShower: boolean;
  amenitiesChangingRoom: boolean;
  amenitiesEquipmentRental: boolean;
  yogaTypes: string[];
}): DashboardStudioListItem {
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

export async function getDashboardStudiosListForUser(
  user: SessionUser & { id: string; role: Role },
): Promise<DashboardStudioListItem[]> {
  if (user.role === 'admin') {
    const studios = await prisma.studio.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return studios.map(mapStudioResponse);
  }

  const business = await prisma.business.findUnique({ where: { ownerUserId: user.id } });
  if (!business) {
    return [];
  }

  const studios = await prisma.studio.findMany({
    where: { businessId: business.id },
    orderBy: { createdAt: 'desc' },
  });

  return studios.map(mapStudioResponse);
}
