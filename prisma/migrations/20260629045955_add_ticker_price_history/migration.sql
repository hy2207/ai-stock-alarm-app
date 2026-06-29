-- CreateTable
CREATE TABLE "TickerPriceHistory" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" BIGINT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TickerPriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TickerPriceHistory_ticker_idx" ON "TickerPriceHistory"("ticker");

-- CreateIndex
CREATE UNIQUE INDEX "TickerPriceHistory_ticker_date_key" ON "TickerPriceHistory"("ticker", "date");
