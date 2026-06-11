import { describe, it, expect, vi, beforeEach } from "vitest";
import { persistEvidenceSnapshots } from "../persistEvidenceSnapshots";
import type { SignalScores } from "../computeSignals";

const mockCreateMany = vi.hoisted(() => vi.fn());

vi.mock("@/lib/prisma", () => ({
  prisma: {
    evidenceSnapshot: {
      createMany: mockCreateMany,
    },
  },
}));

const validSignal: SignalScores = {
  newsSignalScore: 0.5,
  volumeSignalScore: 0.3,
  communitySignalScore: null,
  patternTag: "bull_flag",
};

beforeEach(() => {
  mockCreateMany.mockClear();
});

describe("persistEvidenceSnapshots", () => {
  it("saves snapshot records", async () => {
    mockCreateMany.mockResolvedValue({ count: 2 });

    const result = await persistEvidenceSnapshots([
      { recId: "clx1aaaa", signals: validSignal },
      { recId: "clx1bbbb", signals: validSignal },
    ]);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.count).toBe(2);
    }
    expect(mockCreateMany).toHaveBeenCalledTimes(1);
  });

  it("returns error when input array is empty", async () => {
    const result = await persistEvidenceSnapshots([]);

    expect(result.ok).toBe(false);
    expect(mockCreateMany).not.toHaveBeenCalled();
  });

  it("handles null signal scores", async () => {
    mockCreateMany.mockResolvedValue({ count: 1 });

    const nullSignals: SignalScores = {
      newsSignalScore: null,
      volumeSignalScore: null,
      communitySignalScore: null,
      patternTag: null,
    };

    const result = await persistEvidenceSnapshots([
      { recId: "clx1cccc", signals: nullSignals },
    ]);

    expect(result.ok).toBe(true);
  });

  it("returns error on Prisma failure", async () => {
    mockCreateMany.mockRejectedValue(new Error("DB error"));

    const result = await persistEvidenceSnapshots([
      { recId: "clx1dddd", signals: validSignal },
    ]);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("DB error");
    }
  });
});
