-- CreateEnum
CREATE TYPE "TeachingMode" AS ENUM ('PHYSICAL', 'ONLINE');

-- AlterTable
ALTER TABLE "Studio" ADD COLUMN "teachingMode" "TeachingMode" NOT NULL DEFAULT 'PHYSICAL';
ALTER TABLE "Studio" ADD COLUMN "zoomMeetingUrl" TEXT;
