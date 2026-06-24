import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateRecommendationsForUser } from "@/lib/recommendations/generateRecommendationsForUser";
import { captureServerEvent } from "@/lib/analytics/serverCapture";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface UserResult {
  userId: string;
  generatedCount: number;
  skippedCount: number;
  validationErrors: string[];
  externalApiErrors: string[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    where: {
      watchlist: { some: { ticker: { not: null } } },
    },
    select: { id: true },
  });

  if (users.length === 0) {
    return NextResponse.json({ processed: 0, results: [] });
  }

  const results: UserResult[] = [];
  let totalGenerated = 0;

  for (const user of users) {
    try {
      const result = await generateRecommendationsForUser(user.id);
      results.push({ userId: user.id, ...result });
      totalGenerated += result.generatedCount;
    } catch (err) {
      results.push({
        userId: user.id,
        generatedCount: 0,
        skippedCount: 0,
        validationErrors: [],
        externalApiErrors: [err instanceof Error ? err.message : "Unknown error"],
      });
    }
  }

  try {
    await captureServerEvent("recommendations_generated", {
      processed: users.length,
      totalGenerated,
    });
  } catch {
    // analytics must not surface 5xx
  }

  return NextResponse.json({ processed: users.length, totalGenerated, results });
}
