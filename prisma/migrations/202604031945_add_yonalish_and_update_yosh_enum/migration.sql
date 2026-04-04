-- Add new direction enum and column
CREATE TYPE "Yonalish" AS ENUM ('MATEMATIKA', 'TYPING');

ALTER TABLE "Royxat"
ADD COLUMN "yonalish" "Yonalish" NOT NULL DEFAULT 'MATEMATIKA';

-- Replace old age enum with new values and map existing rows
ALTER TYPE "YoshGruhi" RENAME TO "YoshGruhi_old";

CREATE TYPE "YoshGruhi" AS ENUM ('YOSH_9_11', 'YOSH_12_14');

ALTER TABLE "Royxat"
ALTER COLUMN "yoshGuruhi" TYPE "YoshGruhi"
USING (
  CASE
    WHEN "yoshGuruhi"::text = 'YOSH_6_8' THEN 'YOSH_9_11'
    WHEN "yoshGuruhi"::text = 'YOSH_12_15' THEN 'YOSH_12_14'
    ELSE "yoshGuruhi"::text
  END
)::"YoshGruhi";

DROP TYPE "YoshGruhi_old";

ALTER TABLE "Royxat"
ALTER COLUMN "yonalish" DROP DEFAULT;
