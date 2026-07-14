import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

const PUBLIC_PATH_PREFIXES = [
  "/api/auth",
  "/api/cron",
  "/api/admin/health",
  "/api/dev",
  "/_next",
  "/favicon.ico",
  "/assets",
];

const PROTECTED_PATH_PREFIXES = [
  "/app",
  "/today",
  "/onboarding",
  "/archive",
  "/settings",
  "/recommendations",
  "/state",
];

export function isProtectedPath(pathname: string) {
  if (
    pathname === "/login" ||
    PUBLIC_FILE.test(pathname) ||
    PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  ) {
    return false;
  }

  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  // v5 getToken defaults secureCookie to false (no env detection like v4),
  // so on https it would look for "authjs.session-token" while the browser
  // holds "__Secure-authjs.session-token" — derive it from the request
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
    secureCookie: request.nextUrl.protocol === "https:",
  });

  if (token?.sub && !token.error) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  loginUrl.searchParams.set("callbackUrl", `${pathname}${search}`);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
