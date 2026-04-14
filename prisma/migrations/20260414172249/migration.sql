-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "event_name" TEXT NOT NULL,
    "user_id" TEXT,
    "studio_id" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_event_name_created_at_idx" ON "AnalyticsEvent"("event_name", "created_at");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_studio_id_created_at_idx" ON "AnalyticsEvent"("studio_id", "created_at");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_user_id_created_at_idx" ON "AnalyticsEvent"("user_id", "created_at");
