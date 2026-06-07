-- CreateEnum
CREATE TYPE "BusinessPlatformSubscriptionStatus" AS ENUM ('trial', 'active', 'past_due', 'blocked');

-- CreateEnum
CREATE TYPE "BusinessPlatformPaymentStatus" AS ENUM ('pending', 'paid', 'overdue', 'failed');

-- CreateTable
CREATE TABLE "BusinessPlatformSubscription" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "status" "BusinessPlatformSubscriptionStatus" NOT NULL DEFAULT 'trial',
    "isEarlyAdopter" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "nextPaymentDueAt" TIMESTAMP(3),
    "gracePeriodEndsAt" TIMESTAMP(3),
    "monthlyAmountEur" DOUBLE PRECISION NOT NULL DEFAULT 10,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPlatformSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessPlatformPayment" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "amountEur" DOUBLE PRECISION NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "BusinessPlatformPaymentStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BusinessPlatformPayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlatformSubscription_businessId_key" ON "BusinessPlatformSubscription"("businessId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlatformSubscription_stripeCustomerId_key" ON "BusinessPlatformSubscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlatformSubscription_stripeSubscriptionId_key" ON "BusinessPlatformSubscription"("stripeSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessPlatformPayment_stripeInvoiceId_key" ON "BusinessPlatformPayment"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "BusinessPlatformPayment_subscriptionId_dueDate_idx" ON "BusinessPlatformPayment"("subscriptionId", "dueDate" DESC);

-- AddForeignKey
ALTER TABLE "BusinessPlatformSubscription" ADD CONSTRAINT "BusinessPlatformSubscription_businessId_fkey" FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessPlatformPayment" ADD CONSTRAINT "BusinessPlatformPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "BusinessPlatformSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill platform subscriptions for existing businesses (first 20 get trial, rest active without trial)
INSERT INTO "BusinessPlatformSubscription" (
    "id",
    "businessId",
    "status",
    "isEarlyAdopter",
    "trialEndsAt",
    "nextPaymentDueAt",
    "monthlyAmountEur",
    "createdAt",
    "updatedAt"
)
SELECT
    gen_random_uuid()::text,
    ranked."id",
    CASE
        WHEN ranked.rn <= 20 THEN 'trial'::"BusinessPlatformSubscriptionStatus"
        ELSE 'active'::"BusinessPlatformSubscriptionStatus"
    END,
    ranked.rn <= 20,
    CASE
        WHEN ranked.rn <= 20 THEN ranked."createdAt" + INTERVAL '30 days'
        ELSE NULL
    END,
    CASE
        WHEN ranked.rn <= 20 THEN ranked."createdAt" + INTERVAL '30 days'
        ELSE ranked."createdAt"
    END,
    10,
    ranked."createdAt",
    NOW()
FROM (
    SELECT "id", "createdAt", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
    FROM "Business"
) ranked;
