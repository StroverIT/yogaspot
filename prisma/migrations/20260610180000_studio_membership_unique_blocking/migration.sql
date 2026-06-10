-- Keep the newest blocking membership per user+studio; drop older duplicates.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY "userId", "studioId"
      ORDER BY "createdAt" DESC, id DESC
    ) AS rn
  FROM "StudioMembership"
  WHERE status IN ('active', 'past_due', 'incomplete')
)
DELETE FROM "StudioMembership"
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

CREATE UNIQUE INDEX "StudioMembership_userId_studioId_blocking_key"
ON "StudioMembership"("userId", "studioId")
WHERE status IN ('active', 'past_due', 'incomplete');
