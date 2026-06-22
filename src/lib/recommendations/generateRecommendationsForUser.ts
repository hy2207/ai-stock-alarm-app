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

async function countPublishedCardsToday(userId: string): Promise<number> {
  return prisma.recommendationCard.count({
    where: {
      userId,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
  });
}

async function hasPublishedCardForTickerToday(
  userId: string,
  ticker: string,
): Promise<boolean> {
  const existing = await prisma.recommendationCard.findFirst({
    where: {
      userId,
      ticker,
      status: "published",
      createdAt: {
        gte: todayStart(),
        lt: tomorrowStart(),
      },
    },
    select: { id: true },
  });

  return existing != null;
}

async function collectMarketContext(
  watchlist: WatchlistPromptItem[],
  finnhubToken: string,
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
      const [candleResult, newsResult] = await Promise.all([
        fetchFinnhubCandle(ticker, finnhubToken),
        fetchFinnhubNews(ticker, finnhubToken),
      ]);

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
        }));
      }
    }),
  );

  return { marketData, newsSignals, externalApiErrors };
}

/**
 * Development-oriented orchestration for one daily recommendation batch.
 * Reuses LLM generation, Zod validation, and Prisma persistence helpers.
 */
export async function generateRecommendationsForUser(
  userId: string,
): Promise<GenerateRecommendationsForUserResult> {
  const validationErrors: string[] = [];
  const externalApiErrors: string[] = [];

  const watchlist = await loadWatchlist(userId);
  if (watchlist.length === 0) {
    validationErrors.push("Watchlist is empty. Add at least one ticker first.");
    return {
      generatedCount: 0,
      skippedCount: 0,
      validationErrors,
      externalApiErrors,
    };
  }

  const todayCount = await countPublishedCardsToday(userId);
  if (todayCount >= MAX_DAILY_CARDS) {
    return {
      generatedCount: 0,
      skippedCount: watchlist.length,
      validationErrors,
      externalApiErrors,
    };
  }

  if (todayCount > 0) {
    return {
      generatedCount: 0,
      skippedCount: watchlist.length,
      validationErrors,
      externalApiErrors,
    };
  }

  let targetTicker: WatchlistPromptItem | undefined;
  let skippedCount = 0;

  for (const item of watchlist) {
    if (await hasPublishedCardForTickerToday(userId, item.ticker)) {
      skippedCount += 1;
      continue;
    }
    targetTicker = item;
    break;
  }

  if (!targetTicker) {
    return {
      generatedCount: 0,
      skippedCount,
      validationErrors,
      externalApiErrors,
    };
  }

  const finnhubToken = getFinnhubApiKey();
  if (!finnhubToken) {
    externalApiErrors.push(
      "FINNHUB_API_KEY is not configured. Set it in your environment.",
    );
    return {
      generatedCount: 0,
      skippedCount,
      validationErrors,
      externalApiErrors,
    };
  }

  const { marketData, newsSignals, externalApiErrors: marketErrors } =
    await collectMarketContext(watchlist, finnhubToken);
  externalApiErrors.push(...marketErrors);

  const riskMode = await loadRiskMode(userId);
  const generation = await generateRecommendationCards({
    promptInput: {
      riskMode,
      watchlist,
      marketData,
      newsSignals,
    },
  });

  if (generation.status === "no_call") {
    validationErrors.push(generation.reason);
    return {
      generatedCount: 0,
      skippedCount,
      validationErrors,
      externalApiErrors,
    };
  }

  const cards = await persistRecommendationGeneration({
    userId,
    generation,
  });

  return {
    generatedCount: Math.min(cards.length, MAX_DAILY_CARDS),
    skippedCount,
    validationErrors,
    externalApiErrors,
  };
}
