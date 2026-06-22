import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";

export interface UserWatchlistItem {
  ticker: string;
  sector: string | null;
  priority: number;
}

/**
 * Returns ticker watchlist rows for the authenticated user, ordered by priority.
 */
export async function getUserWatchlist(
  userId?: string | null,
): Promise<UserWatchlistItem[]> {
  const resolvedUserId = userId ?? (await getCurrentUserId());
  if (!resolvedUserId) {
    return [];
  }

  const items = await prisma.watchlist.findMany({
    where: {
      userId: resolvedUserId,
      ticker: { not: null },
    },
    orderBy: { priority: "asc" },
    select: {
      ticker: true,
      sector: true,
      priority: true,
    },
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

export async function userHasWatchlist(userId?: string | null): Promise<boolean> {
  const items = await getUserWatchlist(userId);
  return items.length > 0;
}
