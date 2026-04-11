-- CreateTable
CREATE TABLE "UserClassAttendance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "yogaClassId" TEXT NOT NULL,
    "attendedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserClassAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserClassAttendance_userId_attendedAt_idx" ON "UserClassAttendance"("userId", "attendedAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "UserClassAttendance_userId_yogaClassId_key" ON "UserClassAttendance"("userId", "yogaClassId");

-- AddForeignKey
ALTER TABLE "UserClassAttendance" ADD CONSTRAINT "UserClassAttendance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserClassAttendance" ADD CONSTRAINT "UserClassAttendance_yogaClassId_fkey" FOREIGN KEY ("yogaClassId") REFERENCES "YogaClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;
