import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export interface TickerSearchResult {
  ticker: string;
  name: string;
  sector: string | null;
  marketCapRank: number | null;
}

/** Yahoo Finance symbol-search response shape (undocumented but stable). */
interface YahooSearchResult {
  symbol: string;
  shortname?: string;
  longname?: string;
  sector?: string;
  quoteType?: string;
}

interface YahooSearchResponse {
  quotes?: YahooSearchResult[];
}

async function searchYahooFinance(query: string): Promise<TickerSearchResult[]> {
  try {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&lang=en-US&region=US&quotesCount=8&newsCount=0`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const json: YahooSearchResponse = await res.json();
    const quotes = json.quotes ?? [];

    const equities = quotes.filter(
      (q) => q.quoteType === "EQUITY" && q.symbol && !q.symbol.includes("."),
    );

    const results: TickerSearchResult[] = equities.map((q) => ({
      ticker: q.symbol,
      name: q.longname ?? q.shortname ?? q.symbol,
      sector: q.sector ?? null,
      marketCapRank: null,
    }));

    // Upsert newly discovered tickers so future searches hit the DB
    for (const r of results) {
      await prisma.tickerUniverse.upsert({
        where: { ticker: r.ticker },
        create: { ticker: r.ticker, name: r.name, sector: r.sector, marketCapRank: null },
        update: { name: r.name, sector: r.sector },
      }).catch(() => { /* ignore race conditions */ });
    }

    return results;
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (!q || q.length < 1) {
    return NextResponse.json<TickerSearchResult[]>([]);
  }

  const upper = q.toUpperCase();

  // DB-first: search by ticker prefix OR company name prefix
  const dbResults = await prisma.tickerUniverse.findMany({
    where: {
      OR: [
        { ticker: { startsWith: upper, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: [
      { marketCapRank: { sort: "asc", nulls: "last" } },
      { ticker: "asc" },
    ],
    take: 10,
  });

  if (dbResults.length >= 3) {
    return NextResponse.json<TickerSearchResult[]>(dbResults);
  }

  // Fallback to Yahoo Finance for queries with few/no DB hits
  const yahoo = await searchYahooFinance(q);
  const dbTickers = new Set(dbResults.map((r) => r.ticker));
  const combined = [
    ...dbResults,
    ...yahoo.filter((r) => !dbTickers.has(r.ticker)),
  ].slice(0, 10);

  return NextResponse.json<TickerSearchResult[]>(combined);
}
