import { describe, it, expect } from "vitest";
import {
  evidenceSnapshotCreateSchema,
  evidenceSnapshotSchema,
} from "../evidenceSnapshot";

describe("evidenceSnapshotCreateSchema", () => {
  const validBase = { recId: "clx789jkl" };

  it("parses a minimal payload with only recId", () => {
    const result = evidenceSnapshotCreateSchema.parse(validBase);
    expect(result.recId).toBe("clx789jkl");
  });

  it("parses a full payload with all signal scores", () => {
    const result = evidenceSnapshotCreateSchema.parse({
      ...validBase,
      newsSignalScore: 85,
      volumeSignalScore: 60,
      communitySignalScore: 72,
      patternTag: "bullish-flag",
    });
    expect(result.newsSignalScore).toBe(85);
    expect(result.patternTag).toBe("bullish-flag");
  });

  it("accepts null signal scores", () => {
    const result = evidenceSnapshotCreateSchema.parse({
      ...validBase,
      newsSignalScore: null,
      volumeSignalScore: null,
    });
    expect(result.newsSignalScore).toBeNull();
  });

  it("accepts optional fields omitted", () => {
    const result = evidenceSnapshotCreateSchema.parse(validBase);
    expect(result.newsSignalScore).toBeUndefined();
  });

  it("rejects invalid recId", () => {
    const { success } = evidenceSnapshotCreateSchema.safeParse({
      recId: "",
    });
    expect(success).toBe(false);
  });

  it("rejects a signal score over 100", () => {
    const { success } = evidenceSnapshotCreateSchema.safeParse({
      ...validBase,
      newsSignalScore: 101,
    });
    expect(success).toBe(false);
  });

  it("rejects a signal score under 0", () => {
    const { success } = evidenceSnapshotCreateSchema.safeParse({
      ...validBase,
      volumeSignalScore: -5,
    });
    expect(success).toBe(false);
  });

  it("rejects empty patternTag", () => {
    const { success } = evidenceSnapshotCreateSchema.safeParse({
      ...validBase,
      patternTag: "",
    });
    expect(success).toBe(false);
  });
});

describe("evidenceSnapshotSchema (full output)", () => {
  it("parses a full Prisma row", () => {
    const result = evidenceSnapshotSchema.parse({
      id: "clx111aaa",
      recId: "clx789jkl",
      newsSignalScore: 90,
      volumeSignalScore: null,
      communitySignalScore: null,
      patternTag: "breakout",
      createdAt: new Date("2026-05-28"),
    });
    expect(result.id).toBe("clx111aaa");
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
