import { NextRequest, NextResponse } from "next/server";
import { fetchYahooChart } from "@/lib/market-data/yahooFinance";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // 1-hour cache

interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

function fmtDate(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("ko-KR", {
    month: "numeric",
    day: "numeric",
  });
}

function round2(n: number | null | undefined): number {
  if (n == null || !isFinite(n)) return 0;
  return Math.round(n * 100) / 100;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } },
): Promise<NextResponse> {
  const ticker = params.ticker.toUpperCase();

  if (!/^[A-Z]{1,10}$/.test(ticker)) {
    return NextResponse.json({ error: "Invalid ticker" }, { status: 400 });
  }

  const result = await fetchYahooChart(ticker);

  if (!result.ok) {
    return NextResponse.json(
      { error: result.error.message },
      { status: 502 },
    );
  }

  const { regularMarketPrice, ohlcv } = result.data;

  const points: PricePoint[] = ohlcv
    .filter((p) => p.close != null && p.open != null)
    .map((p) => ({
      date: fmtDate(p.timestamp),
      open: round2(p.open),
      high: round2(p.high),
      low: round2(p.low),
      close: round2(p.close),
    }));

  return NextResponse.json({
    ticker,
    regularMarketPrice: round2(regularMarketPrice),
    ohlcv: points,
  });
}
