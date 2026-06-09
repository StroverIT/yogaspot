-- AlterTable
ALTER TABLE "YogaClass" ADD COLUMN "acceptsMultisport" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ScheduleEntry" ADD COLUMN "acceptsMultisport" BOOLEAN NOT NULL DEFAULT false;
