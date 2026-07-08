"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "홈" },
  { href: "/today", label: "오늘 추천" },
  { href: "/archive", label: "추천 이력" },
  { href: "/settings", label: "설정" },
] as const;

function isActive(href: string, pathname: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  if (href === "/today") {
    // Card detail pages are reached from 오늘 추천 — keep it highlighted there
    return pathname === "/today" || pathname.startsWith("/recommendations");
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
