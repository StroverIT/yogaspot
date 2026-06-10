-- AlterTable
ALTER TABLE "StudioSubscription" ADD COLUMN "name" TEXT,
ADD COLUMN "includes" TEXT,
ADD COLUMN "durationMonths" INTEGER NOT NULL DEFAULT 1;
