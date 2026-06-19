import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions, TokenSet } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import { prisma } from "../prisma";

const JWT_REFRESH_THRESHOLD_SEC = 5 * 60; // refresh when less than 5 minutes remain

type ExtendedToken = Record<string, unknown> & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  error?: string;
};

async function refreshAccessToken(token: ExtendedToken): Promise<ExtendedToken> {
  try {
    if (!token.refreshToken) {
      // No refresh token available — can't refresh
      return { ...token, error: "NoRefreshToken" };
    }

    // Google OAuth token refresh endpoint
    const url = "https://oauth2.googleapis.com/token";
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: token.refreshToken,
    });

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params,
    });

    const refreshed: TokenSet & { error?: string } = await response.json();

    if (!response.ok || refreshed.error) {
      return { ...token, error: "RefreshAccessTokenError" };
    }

    const expiresAt =
      typeof refreshed.expires_at === "number"
        ? refreshed.expires_at * 1000
        : Date.now() +
          (typeof refreshed.expires_in === "number"
            ? refreshed.expires_in
            : 3600) *
            1000;

    return {
      ...token,
      accessToken: refreshed.access_token ?? token.accessToken,
      accessTokenExpires: expiresAt,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    KakaoProvider({
      clientId: process.env.KAKAO_CLIENT_ID ?? "",
      clientSecret: process.env.KAKAO_CLIENT_SECRET ?? "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: store access/refresh tokens from the provider
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: account.expires_at
            ? account.expires_at * 1000
            : undefined,
          error: undefined,
        };
      }

      const extToken = token as ExtendedToken;

      // Token still valid — return as-is
      if (
        extToken.accessTokenExpires &&
        Date.now() < extToken.accessTokenExpires - JWT_REFRESH_THRESHOLD_SEC * 1000
      ) {
        return extToken;
      }

      // Token expired or near-expiry — try refresh
      if (extToken.accessTokenExpires) {
        return refreshAccessToken(extToken);
      }

      // No expiry information — pass through
      return extToken;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      // Expose error state to session for client-side handling
      const extToken = token as ExtendedToken;
      if (extToken.error) {
        (session as { error?: string }).error = extToken.error;
      }
      return session;
    },
  },
};
