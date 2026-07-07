-- CreateTable
CREATE TABLE "ForecastTrustRecord" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "targetDate" TEXT NOT NULL,
    "predicted" DOUBLE PRECISION NOT NULL,
    "bandLow" DOUBLE PRECISION NOT NULL,
    "bandHigh" DOUBLE PRECISION NOT NULL,
    "actualClose" DOUBLE PRECISION,
    "errorPct" DOUBLE PRECISION,
    "inBand" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluatedAt" TIMESTAMP(3),

    CONSTRAINT "ForecastTrustRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ForecastTrustRecord_targetDate_idx" ON "ForecastTrustRecord"("targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "ForecastTrustRecord_ticker_targetDate_key" ON "ForecastTrustRecord"("ticker", "targetDate");
