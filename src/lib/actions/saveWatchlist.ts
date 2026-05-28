"use server";

import { revalidatePath } from "next/cache";
import { saveWatchlistInputSchema } from "../dto/saveWatchlist";
import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";

export async function saveWatchlist(
  data: unknown,
): Promise<{ success: false; error: string } | { success: true }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = saveWatchlistInputSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: "Invalid watchlist data" };
  }

  await prisma.watchlist.deleteMany({ where: { userId } });
  await prisma.watchlist.createMany({
    data: parsed.data.items.map((item, idx) => ({
      userId,
      ticker: item.ticker ?? null,
      sector: item.sector ?? null,
      priority: idx + 1,
    })),
  });

  revalidatePath("/");
  return { success: true };
}
