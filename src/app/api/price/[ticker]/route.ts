import { NextRequest, NextResponse } from "next/server";
import { fetchYahooChart } from "@/lib/market-data/yahooFinance";
import {
  upsertPriceHistory,
  getStoredPriceHistory,
  hasFreshPriceData,
} from "@/lib/market-data/storePriceHistory";

export const dynamic = "force-dynamic";

function fmtDateKo(dateStr: string): string {
  // dateStr is "YYYY-MM-DD" — format to "M/D" for chart x-axis
  const [, m, d] = dateStr.split("-");
  return `${parseInt(m, 10)}/${parseInt(d, 10)}`;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } },
): Promise<NextResponse> {
  const ticker = params.ticker.toUpperCase();

  if (!/^[A-Z]{1,10}$/.test(ticker)) {
    return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
  }

  // ── 1. Check if DB has fresh data (last 3 calendar days) ───────────
  const fresh = await hasFreshPriceData(ticker);

  if (!fresh) {
    // ── 2. Fetch 1-month OHLCV from Yahoo Finance ───────────────────
    const result = await fetchYahooChart(ticker, "1mo");

    if (!result.ok) {
      // Fall back to whatever is in the DB even if stale
      const stored = await getStoredPriceHistory(ticker, 35);
      if (stored.length === 0) {
        return NextResponse.json(
          { error: result.error.message },
          { status: 502 },
        );
      }
      return NextResponse.json({
        ticker,
        regularMarketPrice: stored[stored.length - 1]?.close ?? 0,
        ohlcv: stored.map((p) => ({ ...p, date: fmtDateKo(p.date), volume: undefined })),
        source: "db_stale",
      });
    }

    // ── 3. Persist to DB ────────────────────────────────────────────
    await upsertPriceHistory(ticker, result.data.ohlcv);

    const points = result.data.ohlcv
      .filter((p) => p.close != null && isFinite(p.close))
      .map((p) => ({
        date: fmtDateKo(new Date(p.timestamp * 1000).toISOString().slice(0, 10)),
        open: Math.round(p.open * 100) / 100,
        high: Math.round(p.high * 100) / 100,
        low: Math.round(p.low * 100) / 100,
        close: Math.round(p.close * 100) / 100,
      }));

    return NextResponse.json({
      ticker,
      regularMarketPrice: Math.round(result.data.regularMarketPrice * 100) / 100,
      ohlcv: points,
      source: "yahoo",
    });
  }

  // ── 4. Serve from DB (fast path) ───────────────────────────────────
  const stored = await getStoredPriceHistory(ticker, 35);

  // Still fetch latest regularMarketPrice from Yahoo (cheap — metadata only)
  const priceResult = await fetchYahooChart(ticker, "5d").catch(() => null);
  const regularMarketPrice =
    priceResult?.ok
      ? Math.round(priceResult.data.regularMarketPrice * 100) / 100
      : stored[stored.length - 1]?.close ?? 0;

  return NextResponse.json({
    ticker,
    regularMarketPrice,
    ohlcv: stored.map((p) => ({
      date: fmtDateKo(p.date),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    })),
    source: "db",
  });
}
