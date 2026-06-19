import {
  healthResponseSchema,
  type HealthResponse,
} from "@/lib/dto/healthResponse";

function minutesSince(timestamp?: string): number | null {
  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);
  if (Number.isNaN(parsed)) {
    return null;
  }

  const elapsedMs = Date.now() - parsed;
  return Math.max(0, Math.floor(elapsedMs / 60000));
}

export function buildHealthResponse(): HealthResponse {
  return healthResponseSchema.parse({
    freshness: {
      yahooFinance: minutesSince(process.env.LAST_YAHOO_FINANCE_SYNC_AT),
      finnhub: minutesSince(process.env.LAST_FINNHUB_SYNC_AT),
    },
    nullRate: Number(process.env.MARKET_DATA_NULL_RATE ?? 0),
  });
}
