/**
 * Dev/staging seed only. Creates deterministic users (password: `password123`)
 * and the same graph as `src/data/mock-data.ts`.
 */
import { PrismaClient, Role, ReviewTargetType } from '@prisma/client';
import bcrypt from 'bcrypt';
import {
  mockStudios,
  mockInstructors,
  mockClasses,
  mockReviews,
  mockSchedule,
  mockSubscriptions,
  mockRecentEnrollments,
} from '../src/data/mock-data';

const prisma = new PrismaClient();

const SEED_EMAILS = [
  'admin@seed.zenno.test',
  'business1@seed.zenno.test',
  'business2@seed.zenno.test',
  'business3@seed.zenno.test',
  'client@seed.zenno.test',
] as const;

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?w=800&auto=format&fit=crop&q=80',
];

function yogaTypesForStudio(studioId: string): string[] {
  const fromClasses = new Set<string>();
  for (const c of mockClasses) {
    if (c.studioId === studioId) fromClasses.add(c.yogaType);
  }
  for (const i of mockInstructors) {
    if (i.studioId === studioId) i.yogaStyle.forEach((y) => fromClasses.add(y));
  }
  return Array.from(fromClasses);
}

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await prisma.favorite.deleteMany({
    where: { user: { email: { in: [...SEED_EMAILS] } } },
  });
  await prisma.review.deleteMany({});
  await prisma.recentEnrollment.deleteMany({});
  await prisma.yogaClass.deleteMany({});
  await prisma.scheduleEntry.deleteMany({});
  await prisma.instructor.deleteMany({});
  await prisma.studioSubscription.deleteMany({});
  await prisma.studio.deleteMany({});
  await prisma.business.deleteMany({
    where: { owner: { email: { in: [...SEED_EMAILS] } } },
  });
  await prisma.user.deleteMany({ where: { email: { in: [...SEED_EMAILS] } } });

  await prisma.user.create({
    data: {
      email: 'admin@seed.zenno.test',
      name: 'Seed Admin',
      passwordHash,
      role: Role.admin,
    },
  });

  const biz1 = await prisma.user.create({
    data: {
      email: 'business1@seed.zenno.test',
      name: 'Лотос / Асана (бизнес)',
      passwordHash,
      role: Role.business,
    },
  });
  const biz2 = await prisma.user.create({
    data: {
      email: 'business2@seed.zenno.test',
      name: 'Шанти Йога (бизнес)',
      passwordHash,
      role: Role.business,
    },
  });
  const biz3 = await prisma.user.create({
    data: {
      email: 'business3@seed.zenno.test',
      name: 'Прана (бизнес)',
      passwordHash,
      role: Role.business,
    },
  });

  const client = await prisma.user.create({
    data: {
      email: 'client@seed.zenno.test',
      name: 'Seed Client',
      passwordHash,
      role: Role.client,
    },
  });

  const business1 = await prisma.business.create({ data: { ownerUserId: biz1.id, name: 'Бизнес b1' } });
  const business2 = await prisma.business.create({ data: { ownerUserId: biz2.id, name: 'Бизнес b2' } });
  const business3 = await prisma.business.create({ data: { ownerUserId: biz3.id, name: 'Бизнес b3' } });

  const prismaBusinessByMock: Record<string, string> = {
    b1: business1.id,
    b2: business2.id,
    b3: business3.id,
  };

  const studioIdMap: Record<string, string> = {};

  for (let i = 0; i < mockStudios.length; i++) {
    const s = mockStudios[i];
    const images =
      s.images.length > 0
        ? s.images
        : [PLACEHOLDER_IMAGES[i % PLACEHOLDER_IMAGES.length], PLACEHOLDER_IMAGES[(i + 1) % PLACEHOLDER_IMAGES.length]];

    const created = await prisma.studio.create({
      data: {
        businessId: prismaBusinessByMock[s.businessId],
        name: s.name,
        address: s.address,
        lat: s.lat,
        lng: s.lng,
        description: s.description,
        phone: s.phone,
        email: s.email,
        website: s.website ?? null,
        images,
        amenitiesParking: s.amenities.parking,
        amenitiesShower: s.amenities.shower,
        amenitiesChangingRoom: s.amenities.changingRoom,
        amenitiesEquipmentRental: s.amenities.equipmentRental,
        rating: s.rating,
        reviewCount: s.reviewCount,
        yogaTypes: yogaTypesForStudio(s.id),
        createdAt: new Date(s.createdAt),
      },
    });
    studioIdMap[s.id] = created.id;
  }

  const instructorIdMap: Record<string, string> = {};

  for (const ins of mockInstructors) {
    const sid = studioIdMap[ins.studioId];
    if (!sid) continue;
    const row = await prisma.instructor.create({
      data: {
        studioId: sid,
        name: ins.name,
        photo: ins.photo,
        bio: ins.bio,
        yogaStyle: ins.yogaStyle,
        experienceLevel: ins.experienceLevel,
        rating: ins.rating,
      },
    });
    instructorIdMap[ins.id] = row.id;
  }

  for (const c of mockClasses) {
    const sid = studioIdMap[c.studioId];
    const iid = instructorIdMap[c.instructorId];
    if (!sid || !iid) continue;
    await prisma.yogaClass.create({
      data: {
        studioId: sid,
        instructorId: iid,
        name: c.name,
        date: new Date(c.date),
        startTime: c.startTime,
        endTime: c.endTime,
        maxCapacity: c.maxCapacity,
        enrolled: c.enrolled,
        price: c.price,
        yogaType: c.yogaType,
        difficulty: c.difficulty,
        cancellationPolicy: c.cancellationPolicy,
        waitingList: c.waitingList,
      },
    });
  }

  for (const sch of mockSchedule) {
    const sid = studioIdMap[sch.studioId];
    const iid = instructorIdMap[sch.instructorId];
    if (!sid || !iid) continue;
    await prisma.scheduleEntry.create({
      data: {
        studioId: sid,
        instructorId: iid,
        className: sch.className,
        yogaType: sch.yogaType,
        difficulty: sch.difficulty,
        day: sch.day,
        startTime: sch.startTime,
        endTime: sch.endTime,
        maxCapacity: sch.maxCapacity,
        price: sch.price,
        isRecurring: sch.isRecurring,
      },
    });
  }

  for (const r of mockReviews) {
    let targetId = r.targetId;
    if (r.targetType === 'studio') targetId = studioIdMap[r.targetId] ?? r.targetId;
    if (r.targetType === 'instructor') targetId = instructorIdMap[r.targetId] ?? r.targetId;

    await prisma.review.create({
      data: {
        targetType: r.targetType as ReviewTargetType,
        targetId,
        rating: r.rating,
        text: r.text,
        date: new Date(r.date),
        authorDisplayName: r.userName,
        authorEmail: r.userEmail ?? null,
      },
    });
  }

  for (const sub of mockSubscriptions) {
    const sid = studioIdMap[sub.studioId];
    if (!sid) continue;
    await prisma.studioSubscription.create({
      data: {
        studioId: sid,
        hasMonthlySubscription: sub.hasMonthlySubscription,
        monthlyPrice: sub.monthlyPrice ?? null,
        subscriptionNote: sub.subscriptionNote ?? null,
      },
    });
  }

  for (const e of mockRecentEnrollments) {
    await prisma.recentEnrollment.create({
      data: {
        userDisplayName: e.userName,
        className: e.className,
        studioName: e.studioName,
        enrolledAt: new Date(e.enrolledAt),
      },
    });
  }

  const favStudioIds = [studioIdMap['s1'], studioIdMap['s3']].filter(Boolean);
  for (const studioId of favStudioIds) {
    await prisma.favorite.create({
      data: { userId: client.id, studioId },
    });
  }

  console.log('Seed OK. Log in with any of:', [...SEED_EMAILS].join(', '));
  console.log('Password for all seed users: password123');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
