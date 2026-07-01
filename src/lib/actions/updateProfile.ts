"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "../auth/getServerSession";
import { prisma } from "../prisma";

export interface UpdateProfileInput {
  name: string;
  timezone: string;
}

export interface UpdateProfileResult {
  success: boolean;
  error?: string;
}

const ALLOWED_TIMEZONES = [
  "Asia/Seoul",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Europe/London",
  "Asia/Tokyo",
];

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<UpdateProfileResult> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { success: false, error: "Unauthorized" };
  }

  const name = input.name.trim();
  if (!name || name.length > 50) {
    return { success: false, error: "이름은 1~50자 사이로 입력해 주세요." };
  }

  if (!ALLOWED_TIMEZONES.includes(input.timezone)) {
    return { success: false, error: "지원하지 않는 타임존입니다." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, timezone: input.timezone },
  });

  revalidatePath("/settings/profile");
  return { success: true };
}
