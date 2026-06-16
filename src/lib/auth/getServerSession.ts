import { getServerSession } from "next-auth";
import { authOptions } from "./authOptions";

export async function getAuthSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.user?.id ?? null;
}
