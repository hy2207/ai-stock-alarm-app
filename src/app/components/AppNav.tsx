import Link from "next/link";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { SignOutButton } from "./SignOutButton";

export async function AppNav() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-5">
          <Link href="/" className="text-sm font-semibold text-slate-900 hover:text-blue-600">
            홈
          </Link>
          <Link href="/archive" className="text-sm text-slate-500 hover:text-slate-700">
            추천 이력
          </Link>
          <Link href="/settings" className="text-sm text-slate-500 hover:text-slate-700">
            설정
          </Link>
        </div>
        <SignOutButton />
      </div>
    </nav>
  );
}
