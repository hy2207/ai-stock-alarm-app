import { prisma } from "@/lib/prisma";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@/lib/dto/healthResponse";

function minutesSince(timestamp?: string): number | null {
  if (!timestamp) return null;
  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) return null;
  return Math.max(0, Math.floor((Date.now() - parsed) / 60000));
}

async function checkDb(): Promise<{ connected: boolean; latencyMs: number | null }> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { connected: true, latencyMs: Date.now() - start };
  } catch {
    return { connected: false, latencyMs: null };
  }
}

export async function buildHealthResponse(): Promise<HealthResponse> {
  const db = await checkDb();
  return healthResponseSchema.parse({
    freshness: {
      yahooFinance: minutesSince(process.env.LAST_YAHOO_FINANCE_SYNC_AT),
      finnhub: minutesSince(process.env.LAST_FINNHUB_SYNC_AT),
    },
    nullRate: Number(process.env.MARKET_DATA_NULL_RATE ?? 0),
    db,
  });
}
