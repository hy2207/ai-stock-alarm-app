export type RiskMode = "aggressive" | "balanced" | "conservative";

export interface WatchlistPromptItem {
  ticker: string;
  sector: string | null;
  priority: number;
}

export interface OhlcvPromptPoint {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketPromptData {
  ohlcv: OhlcvPromptPoint[];
}

export interface NewsSignalPromptItem {
  headline: string;
  source: string;
  summary?: string | null;
}

export interface RecommendationPromptInput {
  riskMode: RiskMode;
  watchlist: WatchlistPromptItem[];
  marketData: Record<string, MarketPromptData | undefined>;
  newsSignals: Record<string, NewsSignalPromptItem[] | undefined>;
}

export interface RecommendationPrompt {
  system: string;
  user: string;
}

const DISCLAIMER =
  "투자 참고용 정보이며 투자 자문이 아님. This is not investment advice.";

const CONFIDENCE_MODES: RiskMode[] = [
  "aggressive",
  "balanced",
  "conservative",
];

function formatNumber(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
}

function formatInteger(value: number) {
  return value.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  });
}

function formatOhlcvSummary(ticker: string, data?: MarketPromptData) {
  const points = data?.ohlcv ?? [];

  if (points.length === 0) {
    return `${ticker}: No OHLCV data available. Treat this as insufficient context unless news strongly supports No Call rationale.`;
  }

  const latest = points[points.length - 1];
  const previous = points.length > 1 ? points[points.length - 2] : null;
  const closeChangePct =
    previous && previous.close > 0
      ? ((latest.close - previous.close) / previous.close) * 100
      : null;

  const closeChange =
    closeChangePct == null
      ? "Change: N/A"
      : `Change: ${closeChangePct.toFixed(2)}% vs previous close`;

  return [
    `${ticker}:`,
    `Open: ${formatNumber(latest.open)}`,
    `High: ${formatNumber(latest.high)}`,
    `Low: ${formatNumber(latest.low)}`,
    `Close: ${formatNumber(latest.close)}`,
    `Volume: ${formatInteger(latest.volume)}`,
    closeChange,
  ].join(" ");
}

function formatNewsSignals(ticker: string, signals?: NewsSignalPromptItem[]) {
  const relevantSignals = signals?.slice(0, 3) ?? [];

  if (relevantSignals.length === 0) {
    return `${ticker}: No recent news signals. Treat this as lower confidence context.`;
  }

  const lines = relevantSignals.map((signal) => {
    const summary = signal.summary ? ` — ${signal.summary}` : "";
    return `- [${signal.source}] ${signal.headline}${summary}`;
  });

  return `${ticker} news signals:\n${lines.join("\n")}`;
}

function buildSystemPrompt() {
  return `You are the Decision Layer for a US stock risk-adaptive recommendation product.

${DISCLAIMER}

Return structured JSON only. The response must be one of:
- {"status":"ok","variants":[...]} with exactly 3 variants.
- {"status":"no_call","reason":"..."} when data is insufficient or direction is unclear.

For ok responses:
- Generate exactly 3 confidenceMode variants: ${CONFIDENCE_MODES.join(", ")}.
- Each variant must include ticker, direction, entry price or entry range, target price or target range, holdDays, confidenceMode, and reasonLine.
- holdDays must be an integer from 1 to 10.
- Prefer a 3-5 business days execution culture unless the supplied context strongly supports a shorter or longer horizon.
- reasonLine must be non-empty, ticker-specific, and 160 characters or fewer.
- Do not include candle charts, RSI, MACD, or indicator-first analysis in any user-facing wording.
- Do not invent prices, news, or evidence that is absent from the supplied context.
- If evidence is too thin, choose no_call rather than forcing a weak BUY or SELL.`;
}

function buildUserPrompt(input: RecommendationPromptInput) {
  if (input.watchlist.length === 0) {
    throw new Error("watchlist must contain at least one item");
  }

  const watchlist = input.watchlist
    .map(
      (item) =>
        `- ${item.ticker} | Sector: ${item.sector ?? "N/A"} | Priority: ${item.priority}`,
    )
    .join("\n");

  const market = input.watchlist
    .map((item) => formatOhlcvSummary(item.ticker, input.marketData[item.ticker]))
    .join("\n");

  const news = input.watchlist
    .map((item) => formatNewsSignals(item.ticker, input.newsSignals[item.ticker]))
    .join("\n\n");

  return `SELECTED RISK MODE: ${input.riskMode}

WATCHLIST:
${watchlist}

OHLCV MARKET SUMMARY:
${market}

NEWS SIGNALS:
${news}

Generate the three variants in one response so the UI can switch confidence modes without another LLM call.`;
}

export function buildRecommendationPrompt(
  input: RecommendationPromptInput,
): RecommendationPrompt {
  return {
    system: buildSystemPrompt(),
    user: buildUserPrompt(input),
  };
}
