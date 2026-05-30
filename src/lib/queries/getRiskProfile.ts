import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import type { RiskProfile } from "@/lib/dto/riskProfile";

/**
 * Retrieve the authenticated user's risk profile.
 *
 * Returns `null` when the user is unauthenticated or no profile exists.
 * Callers should default to `"balanced"` when `null` is returned.
 */
export async function getRiskProfile(): Promise<RiskProfile | null> {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  const profile = await prisma.riskProfile.findUnique({
    where: { userId },
  });

  return profile;
}
