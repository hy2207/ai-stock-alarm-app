"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => void signOut({ callbackUrl: "/" })}
      className="text-sm text-slate-500 hover:text-slate-700"
    >
      로그아웃
    </button>
  );
}
