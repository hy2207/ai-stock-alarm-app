import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { NavLinks } from "./NavLinks";
import { SignOutButton } from "./SignOutButton";

export async function AppNav() {
  const userId = await getCurrentUserId();
  if (!userId) return null;

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <NavLinks />
        <SignOutButton />
      </div>
    </nav>
  );
}
