import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { recommendationCardOutputSchema } from "@/lib/dto/recommendationCard";
import type { TodayRecommendationsResponse } from "@/lib/dto/todayRecommendations";
import type { RiskMode } from "@/lib/dto/saveRiskProfile";
import type { RecommendationCard } from "@prisma/client";

const REQUIRED_RISK_MODES = new Set([
  "aggressive",
  "balanced",
  "conservative",
]);

/** Start of the current calendar day (00:00:00.000 UTC). */
function todayStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

/** Start of the next calendar day (00:00:00.000 UTC). */
function tomorrowStart(): Date {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

function readTargetPrice(card: RecommendationCard) {
  if (card.targetPrice != null) {
    return card.targetPrice;
  }
  if (card.targetRangeLow != null && card.targetRangeHigh != null) {
    return (card.targetRangeLow + card.targetRangeHigh) / 2;
  }
  return null;
}

function isSamePrice(a: number, b: number) {
  return Math.abs(a - b) < 0.01;
}

function hasValidRiskModeSet(cards: RecommendationCard[]) {
  if (cards.length < REQUIRED_RISK_MODES.size) {
    return false;
  }

  const aggressive = cards.find((card) => card.confidenceScore === "aggressive");
  const balanced = cards.find((card) => card.confidenceScore === "balanced");
  const conservative = cards.find(
    (card) => card.confidenceScore === "conservative",
  );

  if (
    !aggressive ||
    !balanced ||
    !conservative ||
    aggressive.currentPrice == null ||
    aggressive.stopPrice == null ||
    balanced.stopPrice == null ||
    conservative.stopPrice == null
  ) {
    return false;
  }

  const target = readTargetPrice(aggressive);
  if (target == null) {
    return false;
  }

  const modes = new Set(cards.map((card) => card.confidenceScore));
  if (![...REQUIRED_RISK_MODES].every((mode) => modes.has(mode))) {
    return false;
  }

  const sameThesis = cards.every((card) => {
    const cardTarget = readTargetPrice(card);
    return (
      card.direction === aggressive.direction &&
      card.currentPrice != null &&
      isSamePrice(card.currentPrice, aggressive.currentPrice!) &&
      cardTarget != null &&
      isSamePrice(cardTarget, target)
    );
  });

  if (!sameThesis) {
    return false;
  }

  if (aggressive.direction === "BUY") {
    return (
      target > aggressive.currentPrice &&
      aggressive.stopPrice > balanced.stopPrice &&
      balanced.stopPrice > conservative.stopPrice &&
      aggressive.stopPrice >= target * 0.98
    );
  }

  if (aggressive.direction === "SELL") {
    return (
      target < aggressive.currentPrice &&
      aggressive.stopPrice > balanced.stopPrice &&
      balanced.stopPrice > conservative.stopPrice
    );
  }

  return false;
}

function filterValidRiskModeSets(cards: RecommendationCard[]) {
  const byTicker = new Map<string, RecommendationCard[]>();
  for (const card of cards) {
    const tickerCards = byTicker.get(card.ticker) ?? [];
    tickerCards.push(card);
    byTicker.set(card.ticker, tickerCards);
  }

  return [...byTicker.values()]
    .filter(hasValidRiskModeSet)
    .flat()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Fetch today's published recommendation cards for the authenticated user.
 *
 * - Returns `{ status: "ok", cards: RecommendationCardOutput[] }` when cards exist.
 * - Returns `{ status: "no_call", reason: string }` when no cards for today.
 * - Returns `{ status: "no_call", reason: string }` when unauthenticated.
 *
 * Max 3 cards are returned, ordered by creation time descending.
 */
export async function getTodayRecommendations(): Promise<TodayRecommendationsResponse> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { status: "no_call", reason: "Sign in to see your daily recommendations" };
  }

  const [riskProfile, cards] = await Promise.all([
    prisma.riskProfile.findUnique({ where: { userId } }),
    prisma.recommendationCard.findMany({
      where: {
        userId,
        status: "published",
        createdAt: {
          gte: todayStart(),
          lt: tomorrowStart(),
        },
      },
      orderBy: { createdAt: "desc" },
      take: 9,
    }),
  ]);

  const validCards = filterValidRiskModeSets(cards);

  if (validCards.length === 0 && cards.length > 0) {
    return {
      status: "no_call",
      reason:
        "Today's recommendations need regeneration because saved risk-mode prices are outdated.",
    };
  }

  if (validCards.length === 0) {
    return { status: "no_call", reason: "No recommendations available today. Check back tomorrow morning." };
  }

  const selectedRiskMode: RiskMode =
    riskProfile?.riskMode === "aggressive" ||
    riskProfile?.riskMode === "balanced" ||
    riskProfile?.riskMode === "conservative"
      ? riskProfile.riskMode
      : "balanced";

  return {
    status: "ok",
    selectedRiskMode,
    cards: validCards.map((c) => recommendationCardOutputSchema.parse(c)),
  };
}
