"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/archive", label: "추천 이력" },
  { href: "/settings", label: "설정" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/") {
    // Card detail pages are reached from home — keep 홈 highlighted there
    return pathname === "/" || pathname.startsWith("/recommendations");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-5">
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-sm font-semibold text-slate-900"
                : "text-sm text-slate-500 hover:text-slate-700"
            }
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
