"use server";

import { revalidatePath } from "next/cache";
import { pushConsentInputSchema } from "../dto/pushConsent";
import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";

export async function savePushConsent(
  formData: FormData,
): Promise<{ success: true } | { success: false; error: string }> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const parsed = pushConsentInputSchema.safeParse({
    consent: formData.get("consent"),
  });
  if (!parsed.success) {
    return { success: false, error: "Invalid consent value" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { consentPush: parsed.data.consent },
  });

  revalidatePath("/settings");
  return { success: true };
}
