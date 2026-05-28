import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../prisma";

const testUserId = "test-user-db-001";

afterAll(async () => {
  await prisma.performanceRecord.deleteMany({
    where: { recommendationCard: { userId: testUserId } },
  });
  await prisma.evidenceSnapshot.deleteMany({
    where: { recommendationCard: { userId: testUserId } },
  });
  await prisma.recommendationCard.deleteMany({ where: { userId: testUserId } });
  await prisma.watchlist.deleteMany({ where: { userId: testUserId } });
  await prisma.riskProfile.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });
  await prisma.$disconnect();
});

describe("Prisma Client", () => {
  it("creates a user with related watchlist and queries via relation", async () => {
    const user = await prisma.user.create({
      data: {
        id: testUserId,
        email: "test@db-001.local",
        name: "DB-001 Test",
        signupChannel: "email",
        timezone: "Asia/Seoul",
        consentPush: false,
      },
    });

    expect(user).toBeDefined();
    expect(user.id).toBe(testUserId);

    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: testUserId,
        ticker: "AAPL",
        priority: 1,
      },
    });

    expect(watchlistItem).toBeDefined();
    expect(watchlistItem.ticker).toBe("AAPL");

    const userWithWatchlist = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { watchlist: true },
    });

    expect(userWithWatchlist).toBeDefined();
    expect(userWithWatchlist!.watchlist).toHaveLength(1);
    expect(userWithWatchlist!.watchlist[0].ticker).toBe("AAPL");
  });

  it("creates a RiskProfile with 1:1 relation", async () => {
    const riskProfile = await prisma.riskProfile.create({
      data: {
        userId: testUserId,
        riskMode: "balanced",
      },
    });

    expect(riskProfile).toBeDefined();
    expect(riskProfile.riskMode).toBe("balanced");

    const userWithProfile = await prisma.user.findUnique({
      where: { id: testUserId },
      include: { riskProfile: true },
    });

    expect(userWithProfile!.riskProfile).toBeDefined();
    expect(userWithProfile!.riskProfile!.riskMode).toBe("balanced");
  });

  it("creates a RecommendationCard with nested EvidenceSnapshot", async () => {
    const card = await prisma.recommendationCard.create({
      data: {
        userId: testUserId,
        ticker: "TSLA",
        direction: "BUY",
        entryPrice: 180.0,
        targetPrice: 220.0,
        holdDays: 5,
        confidenceScore: "aggressive",
        reasonLine: "Technical breakout with strong volume",
        status: "published",
        validUntil: new Date("2026-06-01"),
        evidenceSnapshots: {
          create: {
            newsSignalScore: 0.8,
            volumeSignalScore: 0.6,
            patternTag: "breakout",
          },
        },
      },
      include: { evidenceSnapshots: true },
    });

    expect(card).toBeDefined();
    expect(card.evidenceSnapshots).toHaveLength(1);
    expect(card.evidenceSnapshots[0].newsSignalScore).toBe(0.8);
  });
});
