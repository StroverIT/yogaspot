import type { Role } from '@prisma/client';
import type { Review, Studio, SubscriptionRequestDto, YogaClass } from '@/data/mock-data';
import { getPublicCatalog } from '@/lib/get-public-catalog';
import { prisma } from '@/lib/prisma';
import { reviewToDto, studioToDto } from '@/lib/public-studio-dto';
import { subscriptionRequestToDto } from '@/lib/subscription-request-dto';

export type AdminStudioRow = Studio & {
  ownerName: string | null;
  ownerEmail: string | null;
};

export type AdminEnrollmentRow = {
  id: string;
  userName: string;
  className: string;
  studioName: string;
  enrolledAt: string;
};

export type AdminUserRow = {
  id: string;
  name: string | null;
  email: string | null;
  role: Role;
  image: string | null;
};

export type AdminSubscriptionRequestListItem = SubscriptionRequestDto & {
  studioName: string;
  ownerName: string;
  ownerEmail: string;
};

export async function getAdminStudiosForList(): Promise<AdminStudioRow[]> {
  const studios = await prisma.studio.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      business: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
        },
      },
    },
  });
  return studios.map((s) => ({
    ...studioToDto(s),
    ownerName: s.business.owner.name,
    ownerEmail: s.business.owner.email,
  }));
}

export async function getAdminUsersForList(): Promise<AdminUserRow[]> {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
    },
    orderBy: { email: 'asc' },
  });
}

export async function getAdminReviewsForList(): Promise<Review[]> {
  const reviews = await prisma.review.findMany({
    orderBy: { date: 'desc' },
    take: 200,
    include: { author: { select: { image: true, name: true } } },
  });
  return reviews.map(reviewToDto);
}

export async function getAdminRecentEnrollmentsForList(): Promise<AdminEnrollmentRow[]> {
  const rows = await prisma.recentEnrollment.findMany({
    orderBy: { enrolledAt: 'desc' },
    take: 30,
  });
  return rows.map((r) => ({
    id: r.id,
    userName: r.userDisplayName,
    className: r.className,
    studioName: r.studioName,
    enrolledAt: r.enrolledAt.toISOString(),
  }));
}

const PENDING_SUBSCRIPTION_REQUESTS_LIMIT = 5;

export async function getAdminPendingSubscriptionRequestsForList(): Promise<AdminSubscriptionRequestListItem[]> {
  const rows = await prisma.subscriptionRequest.findMany({
    where: { status: 'PENDING' },
    orderBy: { createdAt: 'desc' },
    take: PENDING_SUBSCRIPTION_REQUESTS_LIMIT,
    include: {
      studio: {
        select: {
          name: true,
          business: {
            select: {
              owner: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
  return rows.map((r) => ({
    ...subscriptionRequestToDto(r),
    studioName: r.studio.name,
    ownerName: r.studio.business.owner.name ?? '',
    ownerEmail: r.studio.business.owner.email ?? '',
  }));
}

const OVERVIEW_SUBSCRIPTION_REQUESTS_LIMIT = 5;

/** Latest subscription requests (any status) for admin overview. */
export async function getAdminLatestSubscriptionRequestsForOverview(): Promise<AdminSubscriptionRequestListItem[]> {
  const rows = await prisma.subscriptionRequest.findMany({
    orderBy: { createdAt: 'desc' },
    take: OVERVIEW_SUBSCRIPTION_REQUESTS_LIMIT,
    include: {
      studio: {
        select: {
          name: true,
          business: {
            select: {
              owner: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
  return rows.map((r) => ({
    ...subscriptionRequestToDto(r),
    studioName: r.studio.name,
    ownerName: r.studio.business.owner.name ?? '',
    ownerEmail: r.studio.business.owner.email ?? '',
  }));
}

export type AdminPlatformBillingRow = {
  businessId: string;
  businessName: string | null;
  ownerName: string | null;
  ownerEmail: string | null;
  status: string;
  isEarlyAdopter: boolean;
  trialEndsAt: string | null;
  nextPaymentDueAt: string | null;
  gracePeriodEndsAt: string | null;
  monthlyAmountEur: number;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  payments: {
    id: string;
    amountEur: number;
    dueDate: string;
    paidAt: string | null;
    status: string;
  }[];
};

export async function getAdminPlatformBillingForList(): Promise<AdminPlatformBillingRow[]> {
  const rows = await prisma.businessPlatformSubscription.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      business: {
        include: {
          owner: { select: { name: true, email: true } },
          studios: { select: { name: true }, take: 1 },
        },
      },
      payments: { orderBy: { dueDate: 'desc' }, take: 6 },
    },
  });

  return rows.map((row) => ({
    businessId: row.businessId,
    businessName: row.business.name ?? row.business.studios[0]?.name ?? null,
    ownerName: row.business.owner.name,
    ownerEmail: row.business.owner.email,
    status: row.status,
    isEarlyAdopter: row.isEarlyAdopter,
    trialEndsAt: row.trialEndsAt?.toISOString() ?? null,
    nextPaymentDueAt: row.nextPaymentDueAt?.toISOString() ?? null,
    gracePeriodEndsAt: row.gracePeriodEndsAt?.toISOString() ?? null,
    monthlyAmountEur: row.monthlyAmountEur,
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    payments: row.payments.map((p) => ({
      id: p.id,
      amountEur: p.amountEur,
      dueDate: p.dueDate.toISOString(),
      paidAt: p.paidAt?.toISOString() ?? null,
      status: p.status,
    })),
  }));
}

export type AdminOverviewData = {
  studios: AdminStudioRow[];
  classes: YogaClass[];
  reviews: Review[];
  enrollments: AdminEnrollmentRow[];
  users: AdminUserRow[];
  subscriptionRequests: AdminSubscriptionRequestListItem[];
};

export async function getAdminOverviewData(): Promise<AdminOverviewData> {
  const [studios, catalog, reviews, enrollments, users, subscriptionRequests] = await Promise.all([
    getAdminStudiosForList(),
    getPublicCatalog(),
    getAdminReviewsForList(),
    getAdminRecentEnrollmentsForList(),
    getAdminUsersForList(),
    getAdminLatestSubscriptionRequestsForOverview(),
  ]);
  return {
    studios,
    classes: catalog.classes,
    reviews,
    enrollments,
    users,
    subscriptionRequests,
  };
}
