-- AlterTable
ALTER TABLE "Payment" ADD COLUMN "scheduleEntryBookingId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ScheduleEntry" ADD COLUMN "enrolled" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "ScheduleEntryBooking" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "scheduleEntryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScheduleEntryBooking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ScheduleEntryBooking_scheduleEntryId_idx" ON "ScheduleEntryBooking"("scheduleEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "ScheduleEntryBooking_userId_scheduleEntryId_key" ON "ScheduleEntryBooking"("userId", "scheduleEntryId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_scheduleEntryBookingId_key" ON "Payment"("scheduleEntryBookingId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_scheduleEntryBookingId_fkey" FOREIGN KEY ("scheduleEntryBookingId") REFERENCES "ScheduleEntryBooking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntryBooking" ADD CONSTRAINT "ScheduleEntryBooking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntryBooking" ADD CONSTRAINT "ScheduleEntryBooking_scheduleEntryId_fkey" FOREIGN KEY ("scheduleEntryId") REFERENCES "ScheduleEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Exactly one of class booking or schedule booking per payment row
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_xor_schedule" CHECK (
  (("bookingId" IS NOT NULL)::integer + ("scheduleEntryBookingId" IS NOT NULL)::integer) = 1
);
