/**
 * One-time repair for platform subscriptions stuck in trial/active after trial expiry.
 * Run: npx tsx scripts/repair-platform-billing.ts
 */
import {
  repairExpiredPlatformSubscriptions,
  revalidatePlatformBillingPublicCache,
} from '@/lib/business-platform-billing';
import { prisma } from '@/lib/prisma';

async function main() {
  const repaired = await repairExpiredPlatformSubscriptions();
  console.log(`Repaired ${repaired} subscription(s).`);

  const blockedBusinesses = await prisma.businessPlatformSubscription.findMany({
    where: { status: 'blocked' },
    select: { businessId: true },
  });

  for (const row of blockedBusinesses) {
    await revalidatePlatformBillingPublicCache(row.businessId);
  }

  console.log(`Revalidated public cache for ${blockedBusinesses.length} blocked business(es).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
