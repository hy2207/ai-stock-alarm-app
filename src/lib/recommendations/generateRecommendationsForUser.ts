import { prisma } from "@/lib/prisma";
import {
  fetchFinnhubCandle,
  fetchFinnhubNews,
} from "@/lib/market-data";
import { fetchYahooChart } from "@/lib/market-data/yahooFinance";
import { generateRecommendationCards } from "@/lib/llm/generateRecommendationCards";
import { persistRecommendationGeneration } from "@/lib/llm/persistRecommendationGeneration";
import type {
  RecommendationPromptInput,
  RiskMode,
  WatchlistPromptItem,
} from "@/lib/llm/promptBuilder";

const MAX_DAILY_CARDS = 3;
const REQUIRED_RISK_MODES = new Set([
  "aggressive",
  "balanced",
  "conservative",
]);

interface PublishedCardCompleteness {
  ticker: string;
  confidenceScore: string;
  direction: string;
  currentPrice: number | null;
  targetPrice: number | null;
  targetRangeLow: number | null;
  targetRangeHigh: number | null;
  exitPrice: number | null;
}

export interface GenerateRecommendationsForUserResult {
  generatedCount: number;
  skippedCount: number;
  validationErrors: string[];
  externalApiErrors: string[];
}

function todayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function tomorrowStart(): Date {
  const d = todayStart();
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function getFinnhubApiKey(): string | null {
  const key = process.env.FINNHUB_API_KEY;
  if (!key || key === "your-finnhub-api-key") {
    return null;
  }
  return key;
}

async function loadWatchlist(userId: string): Promise<WatchlistPromptItem[]> {
  const items = await prisma.watchlist.findMany({
    where: { userId, ticker: { not: null } },
    orderBy: { priority: "asc" },
  });

  return items.flatMap((item) =>
    item.ticker
      ? [
          {
            ticker: item.ticker,
            sector: item.sector,
            priority: item.priority,
          },
        ]
      : [],
  );
}

async function loadRiskMode(userId: string): Promise<RiskMode> {
  const profile = await prisma.riskProfile.findUnique({ where: { userId } });
  if (
    profile?.riskMode === "aggressive" ||
    profile?.riskMode === "balanced" ||
    profile?.riskMode === "conservative"
  ) {
    return profile.riskMode;
  }
  return "balanced";
}

async function loadPublishedCardsToday(
  userId: string,
): Promise<PublishedCardCompleteness[]> {
  return prisma.recommendationCard.findMany({
    where: {
      userId,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
    select: {
      ticker: true,
      confidenceScore: true,
      direction: true,
      currentPrice: true,
      targetPrice: true,
      targetRangeLow: true,
      targetRangeHigh: true,
      exitPrice: true,
    },
  });
}

function readTargetPrice(card: PublishedCardCompleteness) {
  if (card.targetPrice != null) {
    return card.targetPrice;
  }
  if (card.targetRangeLow != null && card.targetRangeHigh != null) {
    return (card.targetRangeLow + card.targetRangeHigh) / 2;
  }
  return null;
}

function hasValidDirectionalTarget(card: PublishedCardCompleteness) {
  const target = readTargetPrice(card);
  if (card.currentPrice == null || card.exitPrice == null || target == null) {
    return false;
  }

  if (card.direction === "BUY") {
    return target > card.currentPrice;
  }

  if (card.direction === "SELL") {
    return target < card.currentPrice;
  }

  return false;
}

function isSamePrice(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

function sharesOneConsensusTarget(cards: PublishedCardCompleteness[]) {
  const [first] = cards;
  if (!first) {
    return false;
  }

  const firstTarget = readTargetPrice(first);
  if (first.currentPrice == null || firstTarget == null) {
    return false;
  }

  return cards.every((card) => {
    const target = readTargetPrice(card);
    return (
      card.ticker === first.ticker &&
      card.direction === first.direction &&
      card.currentPrice != null &&
      isSamePrice(card.currentPrice, first.currentPrice!) &&
      target != null &&
      isSamePrice(target, firstTarget)
    );
  });
}

function hasRiskOrderedStops(cards: PublishedCardCompleteness[]) {
  const aggressive = cards.find(
    (card) => card.confidenceScore === "aggressive",
  );
  const balanced = cards.find((card) => card.confidenceScore === "balanced");
  const conservative = cards.find(
    (card) => card.confidenceScore === "conservative",
  );

  if (
    !aggressive?.exitPrice ||
    !balanced?.exitPrice ||
    !conservative?.exitPrice
  ) {
    return false;
  }

  const target = readTargetPrice(aggressive);
  if (target == null) {
    return false;
  }

  return (
    aggressive.exitPrice > balanced.exitPrice &&
    balanced.exitPrice > conservative.exitPrice &&
    (aggressive.direction === "BUY" ? aggressive.exitPrice >= target * 0.98 : true)
  );
}

function hasAllRiskModeVariants(cards: PublishedCardCompleteness[]) {
  if (
    !cards.every(hasValidDirectionalTarget) ||
    !sharesOneConsensusTarget(cards) ||
    !hasRiskOrderedStops(cards)
  ) {
    return false;
  }

  const modes = new Set(cards.map((card) => card.confidenceScore));
  return [...REQUIRED_RISK_MODES].every((mode) => modes.has(mode));
}

function countCompletePublishedTickers(
  cards: PublishedCardCompleteness[],
): number {
  const byTicker = new Map<string, PublishedCardCompleteness[]>();
  for (const card of cards) {
    const tickerCards = byTicker.get(card.ticker) ?? [];
    tickerCards.push(card);
    byTicker.set(card.ticker, tickerCards);
  }

  return [...byTicker.values()].filter(hasAllRiskModeVariants).length;
}

async function replaceTodaysTickerCards(
  userId: string,
  ticker: string,
): Promise<void> {
  await prisma.recommendationCard.deleteMany({
    where: {
      userId,
      ticker,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
  });
}

async function hasCompletePublishedVariantsForTickerToday(
  userId: string,
  ticker: string,
): Promise<boolean> {
  const cards = await prisma.recommendationCard.findMany({
    where: {
      userId,
      ticker,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
    select: {
      ticker: true,
      confidenceScore: true,
      direction: true,
      currentPrice: true,
      targetPrice: true,
      targetRangeLow: true,
      targetRangeHigh: true,
      exitPrice: true,
    },
  });

  return hasAllRiskModeVariants(cards);
}

async function collectMarketContext(
  watchlist: WatchlistPromptItem[],
  finnhubToken: string | null,
): Promise<{
  marketData: RecommendationPromptInput["marketData"];
  newsSignals: RecommendationPromptInput["newsSignals"];
  externalApiErrors: string[];
}> {
  const marketData: RecommendationPromptInput["marketData"] = {};
  const newsSignals: RecommendationPromptInput["newsSignals"] = {};
  const externalApiErrors: string[] = [];

  await Promise.all(
    watchlist.map(async ({ ticker }) => {
      const [candleResult, newsResult] = finnhubToken
        ? await Promise.all([
            fetchFinnhubCandle(ticker, finnhubToken),
            fetchFinnhubNews(ticker, finnhubToken),
          ])
        : [
            {
              ok: false as const,
              error: {
                code: "MISSING_FINNHUB_TOKEN",
                message:
                  "FINNHUB_API_KEY is not configured. Using Yahoo Finance fallback.",
              },
            },
            {
              ok: false as const,
              error: {
                code: "MISSING_FINNHUB_TOKEN",
                message: "FINNHUB_API_KEY is not configured.",
              },
            },
          ];

      if (!candleResult.ok) {
        externalApiErrors.push(
          `Finnhub candle (${ticker}): ${candleResult.error.message}`,
        );

        const yahooResult = await fetchYahooChart(ticker);
        if (!yahooResult.ok) {
          externalApiErrors.push(
            `Yahoo Finance (${ticker}): ${yahooResult.error.message}`,
          );
        } else {
          marketData[ticker] = { ohlcv: yahooResult.data.ohlcv };
        }
      } else {
        marketData[ticker] = { ohlcv: candleResult.data.ohlcv };
      }

      if (!newsResult.ok) {
        externalApiErrors.push(
          `Finnhub news (${ticker}): ${newsResult.error.message}`,
        );
      } else {
        newsSignals[ticker] = newsResult.data.map((article) => ({
          headline: article.headline,
          source: article.source,
          summary: article.summary,
          datetime: article.datetime,
          url: article.url,
        }));
      }
    }),
  );

  return { marketData, newsSignals, externalApiErrors };
}

/**
 * Orchestration for one daily recommendation batch.
 *
 * @param force When true, re-generates today's cards even if complete
 *              variants already exist (replaces them with fresh market data).
 */
export async function generateRecommendationsForUser(
  userId: string,
  { force = false }: { force?: boolean } = {},
): Promise<GenerateRecommendationsForUserResult> {
  const validationErrors: string[] = [];
  const externalApiErrors: string[] = [];

  const [watchlist, todayCards] = await Promise.all([
    loadWatchlist(userId),
    loadPublishedCardsToday(userId),
  ]);

  if (watchlist.length === 0) {
    validationErrors.push("Watchlist is empty. Add at least one ticker first.");
    return {
      generatedCount: 0,
      skippedCount: 0,
      validationErrors,
      externalApiErrors,
    };
  }

  const todayCount = countCompletePublishedTickers(todayCards);
  if (!force && todayCount >= MAX_DAILY_CARDS) {
    return {
      generatedCount: 0,
      skippedCount: watchlist.length,
      validationErrors,
      externalApiErrors,
    };
  }

  const remainingSlots = force ? watchlist.length : MAX_DAILY_CARDS - todayCount;

  const skipFlags = await Promise.all(
    watchlist.map((item) =>
      force
        ? Promise.resolve(false)
        : hasCompletePublishedVariantsForTickerToday(userId, item.ticker),
    ),
  );

  const targetTickers: WatchlistPromptItem[] = [];
  let skippedCount = 0;

  for (let i = 0; i < watchlist.length; i++) {
    if (skipFlags[i]) {
      skippedCount += 1;
      continue;
    }
    if (targetTickers.length >= remainingSlots) {
      skippedCount += 1;
      continue;
    }
    targetTickers.push(watchlist[i]);
  }

  if (targetTickers.length === 0) {
    return {
      generatedCount: 0,
      skippedCount,
      validationErrors,
      externalApiErrors,
    };
  }

  const finnhubToken = getFinnhubApiKey();

  const [{ marketData, newsSignals, externalApiErrors: marketErrors }, riskMode] =
    await Promise.all([
      collectMarketContext(watchlist, finnhubToken),
      loadRiskMode(userId),
    ]);
  externalApiErrors.push(...marketErrors);
  let generatedCount = 0;

  for (const targetTicker of targetTickers) {
    const generation = await generateRecommendationCards({
      promptInput: {
        riskMode,
        watchlist: [targetTicker],
        marketData,
        newsSignals,
      },
    });

    if (generation.status === "no_call") {
      validationErrors.push(`${targetTicker.ticker}: ${generation.reason}`);
      continue;
    }

    await replaceTodaysTickerCards(userId, targetTicker.ticker);
    await persistRecommendationGeneration({
      userId,
      generation,
    });
    generatedCount += 1;
  }

  return {
    generatedCount,
    skippedCount,
    validationErrors,
    externalApiErrors,
  };
}
