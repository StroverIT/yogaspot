-- CreateTable
CREATE TABLE "SubscriptionVideo" (
    "id" TEXT NOT NULL,
    "studioId" TEXT NOT NULL,
    "title" TEXT,
    "youtubeUrl" TEXT NOT NULL,
    "youtubeVideoId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionVideoOnSubscription" (
    "videoId" TEXT NOT NULL,
    "studioSubscriptionId" TEXT NOT NULL,

    CONSTRAINT "SubscriptionVideoOnSubscription_pkey" PRIMARY KEY ("videoId","studioSubscriptionId")
);

-- CreateIndex
CREATE INDEX "SubscriptionVideo_studioId_sortOrder_idx" ON "SubscriptionVideo"("studioId", "sortOrder");

-- CreateIndex
CREATE INDEX "SubscriptionVideoOnSubscription_studioSubscriptionId_idx" ON "SubscriptionVideoOnSubscription"("studioSubscriptionId");

-- AddForeignKey
ALTER TABLE "SubscriptionVideo" ADD CONSTRAINT "SubscriptionVideo_studioId_fkey" FOREIGN KEY ("studioId") REFERENCES "Studio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionVideoOnSubscription" ADD CONSTRAINT "SubscriptionVideoOnSubscription_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "SubscriptionVideo"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionVideoOnSubscription" ADD CONSTRAINT "SubscriptionVideoOnSubscription_studioSubscriptionId_fkey" FOREIGN KEY ("studioSubscriptionId") REFERENCES "StudioSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
