import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { performanceRecordSchema } from "@/lib/dto/performanceRecord";
import type { PerformanceRecord } from "@/lib/dto/performanceRecord";

export interface PerformanceRecordsResult {
  records: PerformanceRecord[];
  totalCount: number;
}

/**
 * Fetch recent performance records for the authenticated user.
 *
 * Returns up to 30 records within the last 30 days, newest first.
 * Includes both hit (success) and miss (failure) entries.
 *
 * Returns an empty list when the user is unauthenticated or no records exist.
 */
export async function getPerformanceRecords(): Promise<PerformanceRecordsResult> {
  const userId = await getCurrentUserId();

  if (!userId) {
    return { records: [], totalCount: 0 };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [records, totalCount] = await Promise.all([
    prisma.performanceRecord.findMany({
      where: {
        recommendationCard: { userId },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.performanceRecord.count({
      where: {
        recommendationCard: { userId },
      },
    }),
  ]);

  return {
    records: records.map((r) => performanceRecordSchema.parse(r)),
    totalCount,
  };
}
