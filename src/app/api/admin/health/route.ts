import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  healthResponseSchema,
  type HealthResponse,
} from "@/lib/dto/healthResponse";

export const dynamic = "force-dynamic";

function minutesSince(date: Date | null): number | null {
  if (!date) return null;
  return Math.floor((Date.now() - date.getTime()) / 60_000);
}

export async function GET(
  _request: NextRequest,
): Promise<NextResponse<HealthResponse | { error: string }>> {
  try {
    const latestCard = await prisma.recommendationCard.findFirst({
      orderBy: { createdAt: "desc" },
      select: { createdAt: true },
    });

    const freshnessMinutes = minutesSince(latestCard?.createdAt ?? null);

    const recentCards = await prisma.recommendationCard.findMany({
      where: { status: { not: "no_call" } },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        entryPrice: true,
        entryRangeLow: true,
        targetPrice: true,
        targetRangeLow: true,
        reasonLine: true,
      },
    });

    const total = recentCards.length;
    const nullCount = recentCards.filter(
      (c) =>
        c.entryPrice == null &&
        c.entryRangeLow == null &&
        c.targetPrice == null &&
        c.targetRangeLow == null,
    ).length;

    const nullRate = total > 0 ? Math.round((nullCount / total) * 100) : 0;

    const result: HealthResponse = {
      freshness: {
        yahooFinance: freshnessMinutes,
        finnhub: freshnessMinutes,
      },
      nullRate,
    };

    return NextResponse.json(healthResponseSchema.parse(result));
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
