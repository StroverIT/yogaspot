-- CreateEnum
CREATE TYPE "StudioMembershipStatus" AS ENUM ('active', 'past_due', 'canceled', 'incomplete');

-- AlterTable
ALTER TABLE "StudioSubscription" ADD COLUMN "stripeProductId" TEXT,
ADD COLUMN "stripePriceId" TEXT;

-- CreateTable
CREATE TABLE "StudioMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "studioSubscriptionId" TEXT,
    "stripeSubscriptionId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "status" "StudioMembershipStatus" NOT NULL DEFAULT 'incomplete',
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudioMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioSubscription_stripePriceId_key" ON "StudioSubscription"("stripePriceId");

-- CreateIndex
CREATE UNIQUE INDEX "StudioMembership_stripeSubscriptionId_key" ON "StudioMembership"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "StudioMembership_userId_studioId_idx" ON "StudioMembership"("userId", "studioId");

-- CreateIndex
CREATE INDEX "StudioMembership_studioId_status_idx" ON "StudioMembership"("studioId", "status");

-- AddForeignKey
ALTER TABLE "StudioMembership" ADD CONSTRAINT "StudioMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioMembership" ADD CONSTRAINT "StudioMembership_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioMembership" ADD CONSTRAINT "StudioMembership_studioSubscriptionId_fkey" FOREIGN KEY ("studioSubscriptionId") REFERENCES "StudioSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
