import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authOptions } from "../authOptions";

beforeEach(() => {
  vi.stubEnv("GOOGLE_CLIENT_ID", "google-id");
  vi.stubEnv("GOOGLE_CLIENT_SECRET", "google-secret");
});

afterEach(() => {
  vi.restoreAllMocks();
});

function makeToken(overrides: Record<string, unknown> = {}) {
  return {
    sub: "clxuserid00000000000001",
    ...overrides,
  };
}

function makeSession(overrides: Record<string, unknown> = {}) {
  return {
    user: { name: "Test", email: "test@example.com" },
    expires: new Date(Date.now() + 86400000).toISOString(),
    ...overrides,
  };
}

describe("authOptions", () => {
  it("has PrismaAdapter", () => {
    expect(authOptions.adapter).toBeDefined();
  });

  it("has two OAuth providers", () => {
    expect(authOptions.providers).toHaveLength(2);
  });

  it("uses JWT session strategy", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
  });
});

describe("session callback", () => {
  it("sets user.id from token.sub", () => {
    const session = authOptions.callbacks?.session?.({
      session: makeSession(),
      token: makeToken(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect((session as Record<string, unknown>)?.user?.id).toBe(
      "clxuserid00000000000001",
    );
  });

  it("propagates refresh error to session.error", () => {
    const session = authOptions.callbacks?.session?.({
      session: makeSession(),
      token: makeToken({ error: "RefreshAccessTokenError" }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect((session as Record<string, unknown>)?.error).toBe(
      "RefreshAccessTokenError",
    );
  });

  it("does not set session.error when token has no error", () => {
    const session = authOptions.callbacks?.session?.({
      session: makeSession(),
      token: makeToken(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect((session as Record<string, unknown>)?.error).toBeUndefined();
  });
});

describe("jwt callback", () => {
  it("stores account tokens on initial sign-in", async () => {
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken(),
      account: {
        access_token: "access-abc",
        refresh_token: "refresh-xyz",
        expires_at: 2000000000,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.accessToken).toBe("access-abc");
    expect(token.refreshToken).toBe("refresh-xyz");
    expect(token.accessTokenExpires).toBe(2000000000 * 1000);
    expect(token.error).toBeUndefined();
  });

  it("returns token as-is when still valid", async () => {
    const farFuture = Date.now() + 86400 * 1000;
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken({
        accessToken: "access-abc",
        accessTokenExpires: farFuture,
        error: undefined,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.accessToken).toBe("access-abc");
    expect(token.error).toBeUndefined();
  });

  it("passes through when no expiry information exists", async () => {
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken({
        accessToken: "access-abc",
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.accessToken).toBe("access-abc");
  });

  it("sets error when expired token has no refresh token", async () => {
    const expired = Date.now() - 1000;
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken({
        accessToken: "access-expired",
        accessTokenExpires: expired,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.error).toBe("NoRefreshToken");
  });

  it("attempts refresh for expired token with refresh token", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "new-access",
        expires_in: 3600,
        refresh_token: "new-refresh",
      }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const expired = Date.now() - 1000;
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken({
        accessToken: "access-expired",
        refreshToken: "refresh-xyz",
        accessTokenExpires: expired,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.accessToken).toBe("new-access");
    expect(token.refreshToken).toBe("new-refresh");
    expect(token.error).toBeUndefined();
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("sets error when refresh API fails", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: "invalid_grant" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const expired = Date.now() - 1000;
    const token = (await authOptions.callbacks?.jwt?.({
      token: makeToken({
        accessToken: "access-expired",
        refreshToken: "refresh-xyz",
        accessTokenExpires: expired,
      }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Record<string, unknown>;

    expect(token.error).toBe("RefreshAccessTokenError");
    expect(mockFetch).toHaveBeenCalledOnce();
  });
});
