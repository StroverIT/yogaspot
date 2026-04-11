-- CreateEnum
CREATE TYPE "ReviewTargetType" AS ENUM ('studio', 'instructor', 'class');

-- AlterTable
ALTER TABLE "Studio" ADD COLUMN     "website" TEXT;

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photo" TEXT NOT NULL DEFAULT '',
    "bio" TEXT NOT NULL,
    "yogaStyle" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "experienceLevel" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "YogaClass" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "enrolled" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL,
    "yogaType" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "cancellationPolicy" TEXT NOT NULL,
    "waitingList" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "YogaClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScheduleEntry" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "yogaType" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "maxCapacity" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "isRecurring" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "targetType" "ReviewTargetType" NOT NULL,
    "targetId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "authorUserId" TEXT,
    "authorDisplayName" TEXT NOT NULL,
    "authorEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudioSubscription" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "hasMonthlySubscription" BOOLEAN NOT NULL DEFAULT false,
    "monthlyPrice" DOUBLE PRECISION,
    "subscriptionNote" TEXT,

    CONSTRAINT "StudioSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecentEnrollment" (
    "id" TEXT NOT NULL,
    "userDisplayName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "studioName" TEXT NOT NULL,
    "enrolledAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecentEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "StudioSubscription_studioId_key" ON "StudioSubscription"("studioId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_studioId_key" ON "Favorite"("userId", "studioId");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YogaClass" ADD CONSTRAINT "YogaClass_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "YogaClass" ADD CONSTRAINT "YogaClass_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScheduleEntry" ADD CONSTRAINT "ScheduleEntry_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudioSubscription" ADD CONSTRAINT "StudioSubscription_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;
