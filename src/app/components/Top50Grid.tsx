import { prisma } from "@/lib/prisma";

export interface Top50Ticker {
  ticker: string;
  name: string;
  sector: string | null;
  marketCapRank: number;
}

export async function getTop50Tickers(): Promise<Top50Ticker[]> {
  const rows = await prisma.tickerUniverse.findMany({
    where: { marketCapRank: { not: null } },
    orderBy: { marketCapRank: "asc" },
    select: { ticker: true, name: true, sector: true, marketCapRank: true },
  });

  return rows.filter((r): r is Top50Ticker => r.marketCapRank !== null);
}
