-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastSignedInAt" TIMESTAMP(3);

-- Latest recorded sign-in from analytics
UPDATE "User" u
SET "lastSignedInAt" = sub.last_sign_in
FROM (
  SELECT user_id, MAX(created_at) AS last_sign_in
  FROM "AnalyticsEvent"
  WHERE user_id IS NOT NULL
    AND event_name IN ('signin_completed_client', 'signin_completed_business')
  GROUP BY user_id
) sub
WHERE u.id = sub.user_id;

-- Legacy users without signup/business dates: use latest sign-in as account start (for trial)
UPDATE "User" u
SET "createdAt" = u."lastSignedInAt"
WHERE u."lastSignedInAt" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "AnalyticsEvent" e
    WHERE e.user_id = u.id
      AND e.event_name IN ('signup_completed', 'studio_signup_completed')
  )
  AND NOT EXISTS (
    SELECT 1 FROM "Business" b WHERE b."ownerUserId" = u.id
  );

-- Users with signup analytics: prefer earliest signup as account start
UPDATE "User" u
SET "createdAt" = sub.signup_at
FROM (
  SELECT user_id, MIN(created_at) AS signup_at
  FROM "AnalyticsEvent"
  WHERE user_id IS NOT NULL
    AND event_name IN ('signup_completed', 'studio_signup_completed')
  GROUP BY user_id
) sub
WHERE u.id = sub.user_id;

-- Business owners: keep business creation as account start
UPDATE "User" u
SET "createdAt" = b."createdAt"
FROM "Business" b
WHERE b."ownerUserId" = u.id;
