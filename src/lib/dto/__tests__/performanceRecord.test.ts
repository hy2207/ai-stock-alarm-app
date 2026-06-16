import { describe, it, expect } from "vitest";
import {
  performanceRecordCreateSchema,
  performanceRecordSchema,
} from "../performanceRecord";

describe("performanceRecordCreateSchema", () => {
  const validBase = {
    recId: "clx789jkl",
    ticker: "AAPL",
    predictedDirection: "BUY" as const,
    evaluationWindowDays: 30,
  };

  it("parses a minimal valid payload", () => {
    const result = performanceRecordCreateSchema.parse(validBase);
    expect(result.ticker).toBe("AAPL");
    expect(result.evaluationWindowDays).toBe(30);
  });

  it("parses a full payload with all optional fields", () => {
    const result = performanceRecordCreateSchema.parse({
      ...validBase,
      realizedReturn: 5.2,
      hitFlag: true,
      evaluatedAt: new Date("2026-05-28"),
    });
    expect(result.realizedReturn).toBe(5.2);
    expect(result.hitFlag).toBe(true);
    expect(result.evaluatedAt).toBeInstanceOf(Date);
  });

  it("accepts null optional fields", () => {
    const result = performanceRecordCreateSchema.parse({
      ...validBase,
      realizedReturn: null,
      hitFlag: null,
      evaluatedAt: null,
    });
    expect(result.realizedReturn).toBeNull();
    expect(result.hitFlag).toBeNull();
  });

  it("accepts SELL as predictedDirection", () => {
    const result = performanceRecordCreateSchema.parse({
      ...validBase,
      predictedDirection: "SELL",
    });
    expect(result.predictedDirection).toBe("SELL");
  });

  it("rejects invalid predictedDirection", () => {
    const { success } = performanceRecordCreateSchema.safeParse({
      ...validBase,
      predictedDirection: "HOLD",
    });
    expect(success).toBe(false);
  });

  it("rejects empty ticker", () => {
    const { success } = performanceRecordCreateSchema.safeParse({
      ...validBase,
      ticker: "",
    });
    expect(success).toBe(false);
  });

  it("rejects evaluationWindowDays less than 1", () => {
    const { success } = performanceRecordCreateSchema.safeParse({
      ...validBase,
      evaluationWindowDays: 0,
    });
    expect(success).toBe(false);
  });

  it("rejects evaluationWindowDays over 365", () => {
    const { success } = performanceRecordCreateSchema.safeParse({
      ...validBase,
      evaluationWindowDays: 366,
    });
    expect(success).toBe(false);
  });

  it("rejects missing recId", () => {
    const { success } = performanceRecordCreateSchema.safeParse({
      ticker: "AAPL",
      predictedDirection: "BUY",
      evaluationWindowDays: 30,
    });
    expect(success).toBe(false);
  });
});

describe("performanceRecordSchema (full output)", () => {
  it("parses a full Prisma row", () => {
    const result = performanceRecordSchema.parse({
      id: "clx222bbb",
      recId: "clx789jkl",
      ticker: "TSLA",
      predictedDirection: "SELL",
      realizedReturn: -3.1,
      hitFlag: false,
      evaluationWindowDays: 14,
      evaluatedAt: new Date("2026-05-28"),
      createdAt: new Date("2026-05-14"),
    });
    expect(result.id).toBe("clx222bbb");
    expect(result.realizedReturn).toBe(-3.1);
    expect(result.hitFlag).toBe(false);
  });

  it("parses a row with null evaluation", () => {
    const result = performanceRecordSchema.parse({
      id: "clx222bbb",
      recId: "clx789jkl",
      ticker: "NVDA",
      predictedDirection: "BUY",
      realizedReturn: null,
      hitFlag: null,
      evaluationWindowDays: 30,
      evaluatedAt: null,
      createdAt: new Date("2026-05-14"),
    });
    expect(result.realizedReturn).toBeNull();
    expect(result.evaluatedAt).toBeNull();
  });
});
