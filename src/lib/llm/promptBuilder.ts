import type { OhlcvPoint, NewsArticle } from "@/lib/market-data/types";

export interface WatchlistItem {
  ticker: string;
  sector: string | null;
  priority: number;
}

export interface PromptInput {
  watchlist: WatchlistItem[];
  ohlcvData: Record<string, OhlcvPoint[]>;
  newsData: Record<string, NewsArticle[]>;
  riskMode: "aggressive" | "balanced" | "conservative";
}

const DISCLAIMER =
  "This is not investment advice. Recommendations are AI-generated based on market data and may not reflect actual future performance. Always do your own research.";

function formatOhlcvSummary(
  ticker: string,
  points: OhlcvPoint[],
): string {
  if (points.length === 0) return `${ticker}: No price data available.`;
  const latest = points[points.length - 1];
  const prev = points.length > 1 ? points[points.length - 2] : null;
  const change =
    prev
      ? `(${((latest.close - prev.close) / prev.close * 100).toFixed(2)}% vs prev close)`
      : "";
  return `${ticker}: $${latest.close.toFixed(2)} ${change} | High: $${latest.high.toFixed(2)} Low: $${latest.low.toFixed(2)} Vol: ${latest.volume.toLocaleString()}`;
}

function formatNewsSummary(
  ticker: string,
  articles: NewsArticle[],
): string {
  if (articles.length === 0) return `${ticker}: No recent news.`;
  const topArticles = articles.slice(0, 3);
  const lines = topArticles.map(
    (a) => `  - [${a.source}] ${a.headline}`,
  );
  return `${ticker} news:\n${lines.join("\n")}`;
}

function buildSystemPrompt(): string {
  return `You are a US stock recommendation assistant. Your output must be factual, data-driven, and concise.

RULES:
- Generate 3 card variants (aggressive, balanced, conservative) for the user's watchlist.
- Each variant uses the same market data but adjusts conviction level:
  - Aggressive: wider price targets, shorter hold periods, higher conviction language.
  - Balanced: moderate targets, medium hold, measured language.
  - Conservative: tighter ranges, longer holds, cautious language.
- Direction must be BUY, SELL, or omit if unclear (use no_call status instead).
- Price entries must be realistic and market-aware.
- holdDays must be between 1 and 10.
- reasonLine must be ≤160 characters, specific to the ticker, not generic.
- If data is insufficient for any ticker, return no_call with a brief reason.

${DISCLAIMER}`;
}

function buildUserPrompt(input: PromptInput): string {
  const watchlistSection = input.watchlist
    .map((w) => `Ticker: ${w.ticker} | Sector: ${w.sector ?? "N/A"} | Priority: ${w.priority}`)
    .join("\n");

  const ohlcvSection = input.watchlist
    .map((w) => formatOhlcvSummary(w.ticker, input.ohlcvData[w.ticker] ?? []))
    .join("\n");

  const newsSection = input.watchlist
    .map((w) => formatNewsSummary(w.ticker, input.newsData[w.ticker] ?? []))
    .join("\n\n");

  return `USER RISK MODE: ${input.riskMode.toUpperCase()}

WATCHLIST:
${watchlistSection}

MARKET DATA:
${ohlcvSection}

RECENT NEWS:
${newsSection}

Generate 3 recommendation card variants (aggressive, balanced, conservative) for each ticker in the watchlist. Use the market data and news to support your reasoning. Each card must include direction, price targets (or ranges), hold days, and a specific reason line.`;
}

export function buildPrompt(input: PromptInput): {
  system: string;
  user: string;
} {
  return {
    system: buildSystemPrompt(),
    user: buildUserPrompt(input),
  };
}
