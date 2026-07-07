export type RiskMode = "aggressive" | "balanced" | "conservative";

export interface WatchlistPromptItem {
  ticker: string;
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
  datetime?: number; // Unix timestamp (seconds) — used to show article date
  url?: string;
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
    `Current price: ${formatNumber(latest.close)}`,
    `Close: ${formatNumber(latest.close)}`,
    `Volume: ${formatInteger(latest.volume)}`,
    closeChange,
  ].join(" ");
}

function formatNewsSignals(ticker: string, signals?: NewsSignalPromptItem[]) {
  const relevantSignals = signals?.slice(0, 5) ?? [];

  if (relevantSignals.length === 0) {
    return `${ticker}: No recent news signals (last 3 days). Treat this as lower confidence context.`;
  }

  const lines = relevantSignals.map((signal) => {
    let dateLabel = "date unknown";
    if (signal.datetime) {
      const d = new Date(signal.datetime * 1000);
      const datePart = d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
      const timePart = d.toLocaleTimeString("en-US", {
        timeZone: "America/New_York",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      dateLabel = `${datePart} ${timePart} ET`;
    }
    const summary = signal.summary ? ` — ${signal.summary}` : "";
    const urlPart = signal.url ? ` [${signal.url}]` : "";
    return `- [${signal.source}] [${dateLabel}]${urlPart} ${signal.headline}${summary}`;
  });

  return `${ticker} news signals (last 3 days, up to 5):\n${lines.join("\n")}`;
}

function buildSystemPrompt() {
  return `You are the Decision Layer for a US stock risk-adaptive recommendation product.

${DISCLAIMER}

Return structured JSON only. The response must be one of:
- {"status":"ok","variants":[...]} with exactly 3 variants.
- {"status":"no_call","reason":"..."} when data is insufficient or direction is unclear.

For ok responses:
- Generate exactly 3 confidenceMode variants: ${CONFIDENCE_MODES.join(", ")}.
- Each variant must include ticker, direction, currentPrice, entry price or entry range, target price or target range, holdDays, confidenceMode, and reasonLine.
- Each variant must include newsItems: an array of 1–5 objects (one per cited article from NEWS SIGNALS), each containing:
  { "source": "<original source name>", "headlineKo": "<headline in Korean, ≤100 chars>", "summaryKo": "<one sentence in Korean explaining why this article supports the BUY/SELL, ≤160 chars>", "publishedAt": "<copy the date+time label from the NEWS SIGNALS bracket verbatim, e.g. '2026-06-27 14:30 ET'>", "url": "<copy the URL from the NEWS SIGNALS bracket verbatim if present, otherwise omit>" }
- Include all relevant articles from NEWS SIGNALS (minimum 1 if any are supplied, maximum 5).
- If no NEWS SIGNALS are available, set newsItems to an empty array [].
- All 3 variants for the same ticker must include the same newsItems array.
- currentPrice must match the latest supplied market close/current price for that ticker; do not invent it.
- targetPrice is the same evidence-based consensus target in all three variants for the ticker. Base it on supplied news and analyst target references when present; if analyst target references are absent, infer cautiously from supplied context without inventing external facts.
- Do not use confidenceMode to change targetPrice. Risk mode changes execution behavior and stop/exit discipline, not the underlying news and analyst target thesis.
- For BUY, targetPrice/targetRange must be above currentPrice. For SELL, targetPrice/targetRange must be below currentPrice.
- exitPrice is the actual sell/exit price for the investor, not only a loss-cut price. Do not interpret it as maximum loss only.
- Conservative means using the lowest actual sell/exit threshold among the three modes, because this user sells earlier.
- Balanced means a middle actual sell/exit threshold between conservative and aggressive.
- Aggressive means the user can tolerate FOMO/momentum and may keep holding despite BUY or SELL risk signals. This mode uses the highest actual sell/exit threshold among the three modes, and the Korean rationale must explain the evidence-based reason.
- For both BUY and SELL, exitPrice must be ordered aggressive > balanced > conservative because aggressive users hold longer before actually selling.
- For BUY, the aggressive exitPrice must be close to the targetPrice or above targetPrice.
- For SELL, the aggressive exitPrice must be higher than balanced and conservative because aggressive users may keep holding despite the SELL signal; it may be well above the downside target when the supplied evidence supports waiting for a rebound.
- The three variants should usually differ in entry tolerance, stop/exit discipline, and holdDays. Their targetPrice must remain the same.
- holdDays must be an integer from 1 to 10.
- Prefer a 3-5 business days execution culture unless the supplied context strongly supports a shorter or longer horizon.
- reasonLine must be Korean, non-empty, ticker-specific, and 160 characters or fewer.
- reasonLine must compactly summarize why the card is BUY or SELL.
- newsItems must not invent article facts, source names, prices, or events absent from NEWS SIGNALS.
- Do not include candle charts, RSI, MACD, or indicator-first analysis in any user-facing wording.
- BUY or SELL must be decided from supplied news signals plus market context. Do not invent prices, news, or evidence that is absent from the supplied context.
- If evidence is too thin, choose no_call rather than forcing a weak BUY or SELL.`;
}

function buildUserPrompt(input: RecommendationPromptInput) {
  if (input.watchlist.length === 0) {
    throw new Error("watchlist must contain at least one item");
  }

  const watchlist = input.watchlist
    .map(
      (item) =>
        `- ${item.ticker} | Priority: ${item.priority}`,
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
