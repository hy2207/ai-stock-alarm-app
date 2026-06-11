import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import type { PerformanceRecord } from "@/lib/dto/performanceRecord";

const MAX_RECORDS = 30;
const MAX_DAYS = 30;

export async function getPerformanceRecords(): Promise<PerformanceRecord[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MAX_DAYS);

  const records = await prisma.performanceRecord.findMany({
    where: {
      recommendationCard: {
        userId,
      },
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "desc" },
    take: MAX_RECORDS,
  });

  return records as PerformanceRecord[];
}
