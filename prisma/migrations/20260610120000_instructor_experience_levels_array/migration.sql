-- Convert instructor experienceLevel from single text to text array
ALTER TABLE "Instructor"
ALTER COLUMN "experienceLevel" TYPE TEXT[]
USING CASE
  WHEN "experienceLevel" IS NULL OR TRIM("experienceLevel") = '' THEN ARRAY[]::TEXT[]
  ELSE ARRAY[TRIM("experienceLevel")]
END;

ALTER TABLE "Instructor"
ALTER COLUMN "experienceLevel" SET DEFAULT ARRAY[]::TEXT[];
