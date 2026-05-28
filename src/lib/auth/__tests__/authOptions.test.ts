import { describe, it, expect, vi } from "vitest";
import { authOptions } from "../authOptions";

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

  it("session callback sets user.id from token.sub", () => {
    const session = authOptions.callbacks?.session?.({
      session: {
        user: { name: "Test", email: "test@example.com" },
        expires: new Date(Date.now() + 86400000).toISOString(),
      },
      token: { sub: "clxuserid00000000000001" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);
    expect(session?.user?.id).toBe("clxuserid00000000000001");
  });
});
