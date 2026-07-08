import Link from "next/link";
import Image from "next/image";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { NavLinks } from "./NavLinks";
import { SignOutButton } from "./SignOutButton";

export async function AppNav() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex shrink-0 items-center" aria-label="StockAlarm 홈">
            <Image
              src="/brand/stockalarm-logo.png"
              alt="StockAlarm"
              width={96}
              height={72}
              className="h-9 w-auto"
              priority
            />
          </Link>
          <NavLinks />
        </div>
        <SignOutButton />
      </div>
    </nav>
  );
}
