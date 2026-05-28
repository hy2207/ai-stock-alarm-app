import { describe, it, expect } from "vitest";
import { userCreateSchema } from "../../dto/user";
import { riskProfileCreateSchema } from "../../dto/riskProfile";
import { watchlistCreateSchema } from "../../dto/watchlist";
import {
  mockUser,
  mockRiskProfile,
  mockWatchlist,
  mockMinimalWatchlist,
  mockUserWithKakao,
} from "../user";

describe("mockUser fixtures", () => {
  it("passes Zod validation for mockUser", () => {
    const result = userCreateSchema.safeParse(mockUser);
    expect(result.success).toBe(true);
  });

  it("passes Zod validation for mockUserWithKakao", () => {
    const result = userCreateSchema.safeParse(mockUserWithKakao);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBeNull();
      expect(result.data.consentPush).toBe(false);
    }
  });
});

describe("mockRiskProfile fixture", () => {
  it("passes Zod validation", () => {
    const result = riskProfileCreateSchema.safeParse(mockRiskProfile);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.riskMode).toBe("balanced");
    }
  });
});

describe("mockWatchlist fixtures", () => {
  it("all 3 items pass Zod validation", () => {
    for (const item of mockWatchlist) {
      const result = watchlistCreateSchema.safeParse(item);
      expect(result.success).toBe(true);
    }
  });

  it("has correct priorities", () => {
    expect(mockWatchlist[0].priority).toBe(1);
    expect(mockWatchlist[1].priority).toBe(2);
    expect(mockWatchlist[2].priority).toBe(3);
  });

  it("includes ticker, sector, and ticker items", () => {
    expect(mockWatchlist[0].ticker).toBe("AAPL");
    expect(mockWatchlist[1].sector).toBe("Technology");
    expect(mockWatchlist[2].ticker).toBe("TSLA");
  });

  it("minimal watchlist passes validation", () => {
    const result = watchlistCreateSchema.safeParse(mockMinimalWatchlist[0]);
    expect(result.success).toBe(true);
  });

  it("minimal watchlist has correct values", () => {
    expect(mockMinimalWatchlist[0].ticker).toBe("NVDA");
    expect(mockMinimalWatchlist[0].priority).toBe(1);
  });
});
