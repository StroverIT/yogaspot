-- CreateEnum
CREATE TYPE "FitsysSyncRequestStatus" AS ENUM ('PENDING', 'SYNCED', 'DECLINED');

-- CreateTable
CREATE TABLE "FitsysSyncRequest" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "fitsysUrl" TEXT NOT NULL,
    "status" "FitsysSyncRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FitsysSyncRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FitsysSyncRequest_studioId_status_idx" ON "FitsysSyncRequest"("studioId", "status");

-- CreateIndex
CREATE INDEX "FitsysSyncRequest_status_createdAt_idx" ON "FitsysSyncRequest"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "FitsysSyncRequest" ADD CONSTRAINT "FitsysSyncRequest_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
