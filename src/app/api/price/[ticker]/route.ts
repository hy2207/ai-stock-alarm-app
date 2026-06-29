import { NextRequest, NextResponse } from "next/server";
import { syncPriceHistory } from "@/lib/market-data/priceSync";

export const dynamic = "force-dynamic";

function fmtDateKo(dateStr: string): string {
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

  const { ohlcv, regularMarketPrice, regularMarketTime } =
    await syncPriceHistory(ticker);

  if (ohlcv.length === 0 && regularMarketPrice === null) {
    return NextResponse.json(
      { error: `No price data available for ${ticker}` },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ticker,
    regularMarketPrice: regularMarketPrice ?? ohlcv[ohlcv.length - 1]?.close ?? 0,
    regularMarketTime: regularMarketTime ?? null,
    ohlcv: ohlcv.map((p) => ({
      date: fmtDateKo(p.date),
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    })),
  });
}
