import type { OhlcvPoint, NewsArticle } from "@/lib/market-data/types";

export interface SignalScores {
  newsSignalScore: number | null;
  volumeSignalScore: number | null;
  communitySignalScore: number | null;
  patternTag: string | null;
}

const POSITIVE_WORDS = [
  "beat", "surge", "growth", "upgrade", "bullish", "outperform",
  "positive", "strong", "record", "growth", "profit", "rally",
  "innovation", "expansion", "dividend", "buyback", "partnership",
];
const NEGATIVE_WORDS = [
  "miss", "decline", "downgrade", "bearish", "underperform",
  "negative", "weak", "loss", "cut", "investigation", "lawsuit",
  "restructuring", "layoff", "volatile", "downturn", "debt",
];

/** Compute a news sentiment signal score (-1 to +1) from articles. */
function computeNewsSignal(articles: NewsArticle[]): number | null {
  if (articles.length === 0) return null;

  let score = 0;
  let count = 0;

  for (const article of articles) {
    const text = `${article.headline} ${article.summary}`.toLowerCase();

    const positiveHits = POSITIVE_WORDS.filter((w) => text.includes(w)).length;
    const negativeHits = NEGATIVE_WORDS.filter((w) => text.includes(w)).length;

    const articleScore =
      positiveHits + negativeHits > 0
        ? (positiveHits - negativeHits) / (positiveHits + negativeHits)
        : 0;

    score += articleScore;
    count++;
  }

  const avg = score / count;
  return Math.round(Math.min(1, Math.max(-1, avg)) * 100) / 100;
}

/** Compute a volume signal score based on current vs recent volume. */
function computeVolumeSignal(
  points: OhlcvPoint[],
): number | null {
  if (points.length < 2) return null;

  const current = points[points.length - 1].volume;
  const prevAvg =
    points.slice(0, -1).reduce((sum, p) => sum + p.volume, 0) /
    (points.length - 1);

  if (prevAvg === 0) return null;

  const ratio = current / prevAvg;
  // ratio > 1.5 → elevated (signal +0.5), ratio < 0.5 → diminished (signal -0.5)
  const score = Math.round((Math.min(2, Math.max(0.25, ratio)) - 1) * 100) / 100;
  return Math.min(0.5, Math.max(-0.5, score));
}

/** Detect a simple price-action pattern from recent OHLCV. */
function detectPattern(points: OhlcvPoint[]): string | null {
  if (points.length < 3) return null;

  const closes = points.map((p) => p.close);
  const last2 = closes.slice(-2);
  const last3 = closes.slice(-3);

  // Bull flag: 3+ consecutive higher closes
  if (last3[0] < last3[1] && last3[1] < last3[2]) return "bull_flag";

  // Bear flag: 3+ consecutive lower closes
  if (last3[0] > last3[1] && last3[1] > last3[2]) return "bear_flag";

  // Doji-like: close is between prev open and close with small range
  const prev = points[points.length - 2];
  const curr = points[points.length - 1];
  const rangePercent = ((curr.high - curr.low) / curr.low) * 100;
  if (rangePercent < 0.5) return "low_volatility";

  // Bounce from support: prev low < open and close > open
  if (curr.close > curr.open && prev.low < curr.open) return "support_bounce";

  if (curr.close < curr.open && prev.high > curr.open) return "resistance_reject";

  return null;
}

/**
 * Compute signal scores from market data.
 */
export function computeSignals(
  articles: NewsArticle[],
  ohlcv: OhlcvPoint[],
): SignalScores {
  return {
    newsSignalScore: computeNewsSignal(articles),
    volumeSignalScore: computeVolumeSignal(ohlcv),
    communitySignalScore: null,
    patternTag: detectPattern(ohlcv),
  };
}
