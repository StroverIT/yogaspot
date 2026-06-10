-- AlterTable
ALTER TABLE "Business" ADD COLUMN "stripeConnectAccountId" TEXT,
ADD COLUMN "stripeConnectChargesEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "stripeConnectDetailsSubmitted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "Business_stripeConnectAccountId_key" ON "Business"("stripeConnectAccountId");
