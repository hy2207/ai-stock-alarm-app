import { auth } from "./nextAuth";

export async function getAuthSession() {
  return auth();
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getAuthSession();
  return session?.user?.id ?? null;
}
