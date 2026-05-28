"use server";

import { revalidatePath } from "next/cache";
import { saveRiskProfileInputSchema } from "../dto/saveRiskProfile";
import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";

export async function saveRiskProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false as const, error: "Unauthorized" };
  }

  const raw = {
    riskMode: formData.get("riskMode"),
  };

  const parsed = saveRiskProfileInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false as const, error: "Invalid riskMode" };
  }

  await prisma.riskProfile.upsert({
    where: { userId },
    create: { userId, riskMode: parsed.data.riskMode },
    update: { riskMode: parsed.data.riskMode },
  });

  revalidatePath("/");
  return { success: true as const };
}
