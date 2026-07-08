"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";

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

/**
 * Deletes today's published recommendation cards for the current user
 * so the home page transitions to the no_call state and TodayCardAutoLoader
 * triggers a fresh generation based on the updated watchlist.
 */
export async function resetTodayCards(): Promise<{ success: boolean }> {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false };

  await prisma.recommendationCard.deleteMany({
    where: {
      userId,
      status: "published",
      createdAt: { gte: todayStart(), lt: tomorrowStart() },
    },
  });

  revalidatePath("/today");
  return { success: true };
}
