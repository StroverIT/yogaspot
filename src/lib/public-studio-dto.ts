import type {
  Instructor,
  Retreat,
  Review,
  ScheduleEntry,
  Studio,
  StudioSubscription,
  YogaClass,
} from '@/data/mock-data';
import { teachingModeFromPrisma } from '@/lib/teaching-mode';
import type {
  Instructor as PrismaInstructor,
  Retreat as PrismaRetreat,
  Review as PrismaReview,
  Studio as PrismaStudio,
} from '@prisma/client';
import type { YogaClass as PrismaYogaClass, ScheduleEntry as PrismaScheduleEntry, StudioSubscription as PrismaSub } from '@prisma/client';

type StudioRowForDto = PrismaStudio & {
  business?: { ownerUserId: string };
};

export function studioToDto(s: StudioRowForDto): Studio {
  return {
    id: s.id,
    name: s.name,
    teachingMode: teachingModeFromPrisma(s.teachingMode),
    address: s.address,
    lat: s.lat ?? 0,
    lng: s.lng ?? 0,
    images: s.images ?? [],
    description: s.description,
    website: s.website ?? undefined,
    phone: s.phone,
    email: s.email,
    amenities: {
      parking: s.amenitiesParking,
      shower: s.amenitiesShower,
      changingRoom: s.amenitiesChangingRoom,
      equipmentRental: s.amenitiesEquipmentRental,
    },
    rating: s.rating,
    reviewCount: s.reviewCount,
    businessId: s.businessId,
    ownerUserId: s.business?.ownerUserId ?? '',
    isHidden: s.isHidden,
    createdAt: s.createdAt.toISOString().slice(0, 10),
    yogaTypes: s.yogaTypes ?? [],
  };
}

export function instructorToDto(i: PrismaInstructor): Instructor {
  return {
    id: i.id,
    name: i.name,
    photo: i.photo,
    bio: i.bio,
    yogaStyle: i.yogaStyle ?? [],
    experienceLevel: i.experienceLevel,
    studioId: i.studioId,
    rating: i.rating,
  };
}

export function yogaClassToDto(c: PrismaYogaClass): YogaClass {
  return {
    id: c.id,
    name: c.name,
    instructorId: c.instructorId,
    studioId: c.studioId,
    date: c.date.toISOString().slice(0, 10),
    startTime: c.startTime,
    endTime: c.endTime,
    maxCapacity: c.maxCapacity,
    enrolled: c.enrolled,
    price: c.price,
    yogaType: c.yogaType,
    difficulty: c.difficulty as YogaClass['difficulty'],
    cancellationPolicy: c.cancellationPolicy,
    waitingList: c.waitingList ?? [],
  };
}

export function scheduleEntryToDto(s: PrismaScheduleEntry): ScheduleEntry {
  return {
    id: s.id,
    studioId: s.studioId,
    className: s.className,
    instructorId: s.instructorId,
    yogaType: s.yogaType,
    difficulty: s.difficulty as ScheduleEntry['difficulty'],
    day: s.day as ScheduleEntry['day'],
    startTime: s.startTime,
    endTime: s.endTime,
    maxCapacity: s.maxCapacity,
    enrolled: s.enrolled,
    price: s.price,
    isRecurring: s.isRecurring,
  };
}

export function retreatToDto(r: PrismaRetreat): Retreat {
  return {
    id: r.id,
    studioId: r.studioId,
    title: r.title,
    description: r.description,
    activities: r.activities ?? [],
    images: r.images ?? [],
    address: r.address,
    lat: r.lat ?? 0,
    lng: r.lng ?? 0,
    startDate: r.startDate.toISOString().slice(0, 10),
    endDate: r.endDate.toISOString().slice(0, 10),
    duration: r.duration,
    maxCapacity: r.maxCapacity,
    enrolled: r.enrolled,
    price: r.price,
    isPublished: r.isPublished,
    isHidden: r.isHidden,
    createdAt: r.createdAt.toISOString(),
  };
}

export function subscriptionToDto(sub: PrismaSub): StudioSubscription {
  return {
    studioId: sub.studioId,
    hasMonthlySubscription: sub.hasMonthlySubscription,
    monthlyPrice: sub.monthlyPrice ?? undefined,
    subscriptionNote: sub.subscriptionNote ?? undefined,
  };
}

type ReviewRowForDto = PrismaReview & {
  author?: { image: string | null; name: string | null } | null;
};

export function reviewToDto(r: ReviewRowForDto): Review {
  const snapImage = r.author?.image?.trim();
  return {
    id: r.id,
    userId: r.authorUserId ?? 'anon',
    userName: r.authorDisplayName,
    userImage: snapImage && snapImage.length > 0 ? snapImage : undefined,
    userEmail: r.authorEmail ?? undefined,
    targetId: r.targetId,
    targetType: r.targetType as Review['targetType'],
    rating: r.rating,
    text: r.text,
    date: r.date.toISOString().slice(0, 10),
  };
}
