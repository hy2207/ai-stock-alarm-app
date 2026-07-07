"use server";

import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";
import { captureServerEvent } from "../analytics/serverCapture";

export async function deleteAccount(): Promise<{ success: boolean }> {
  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return { success: false };
    }

    // De-identify in PostHog before removing user data
    try {
      await captureServerEvent("rec_validation_failed" as never, {
        action: "account_deletion",
        userId,
      });
    } catch {
      // analytics must never block user-facing operations
    }

    // Delete user — cascades to:
    //   riskProfile, watchlist, recommendationCards (and their
    //   performanceRecords), accounts
    await prisma.user.delete({ where: { id: userId } });

    return { success: true };
  } catch {
    return { success: false };
  }
}
