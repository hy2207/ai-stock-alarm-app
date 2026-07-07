-- DropForeignKey
ALTER TABLE "EvidenceSnapshot" DROP CONSTRAINT "EvidenceSnapshot_recId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- AlterTable
ALTER TABLE "RecommendationCard" DROP COLUMN "entryRangeHigh",
DROP COLUMN "entryRangeLow",
DROP COLUMN "newsRationaleKo",
DROP COLUMN "targetRangeHigh",
DROP COLUMN "targetRangeLow";

-- AlterTable
ALTER TABLE "Watchlist" DROP COLUMN "sector";

-- DropTable
DROP TABLE "EvidenceSnapshot";

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "VerificationToken";

