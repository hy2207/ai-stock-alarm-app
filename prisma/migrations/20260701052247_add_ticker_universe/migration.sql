-- CreateTable
CREATE TABLE "TickerUniverse" (
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT,
    "marketCapRank" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TickerUniverse_pkey" PRIMARY KEY ("ticker")
);

-- CreateIndex
CREATE INDEX "TickerUniverse_marketCapRank_idx" ON "TickerUniverse"("marketCapRank");
