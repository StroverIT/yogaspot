-- AlterTable
ALTER TABLE "User" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Backfill business owners from their Business record (closest proxy before this column existed)
UPDATE "User" u
SET "createdAt" = b."createdAt"
FROM "Business" b
WHERE b."ownerUserId" = u.id;
