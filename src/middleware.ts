import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicPaths = [
  "/login",
  "/api/auth",
  "/api/cron",
  "/api/admin/health",
];

/** Check if a path is public (no authentication required). */
export function isPublicPath(pathname: string): boolean {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
