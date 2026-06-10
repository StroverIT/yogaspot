-- CreateEnum
CREATE TYPE "BookingPaymentMode" AS ENUM ('onsite', 'online', 'both');

-- AlterTable
ALTER TABLE "YogaClass" ADD COLUMN "paymentMode" "BookingPaymentMode" NOT NULL DEFAULT 'online';

-- AlterTable
ALTER TABLE "ScheduleEntry" ADD COLUMN "paymentMode" "BookingPaymentMode" NOT NULL DEFAULT 'online';

-- AlterTable
ALTER TABLE "Retreat" ADD COLUMN "paymentMode" "BookingPaymentMode" NOT NULL DEFAULT 'onsite';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "retreatBookingId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_retreatBookingId_key" ON "Payment"("retreatBookingId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_retreatBookingId_fkey" FOREIGN KEY ("retreatBookingId") REFERENCES "RetreatBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: free classes/schedule -> onsite
UPDATE "YogaClass" SET "paymentMode" = 'onsite' WHERE price = 0;
UPDATE "ScheduleEntry" SET "paymentMode" = 'onsite' WHERE price = 0;
