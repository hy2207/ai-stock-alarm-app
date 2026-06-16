import type { PerformanceRecordCreateInput } from "../dto/performanceRecord";
import { MOCK_USER_ID } from "./user";

/** Shared recId for linking PerformanceRecord fixtures to RecommendationCard fixtures. */
export const MOCK_CARD_ID = "clxrec000000000000000001" as const;

const baseRecord = {
  recId: MOCK_CARD_ID,
  evaluationWindowDays: 5,
};

export const mockPerformanceRecords: PerformanceRecordCreateInput[] = [
  // === BUY hits (positive realizedReturn) ===
  { ...baseRecord, ticker: "AAPL", predictedDirection: "BUY", realizedReturn: 3.2, hitFlag: true, evaluatedAt: new Date("2026-05-20") },
  { ...baseRecord, ticker: "NVDA", predictedDirection: "BUY", realizedReturn: 8.7, hitFlag: true, evaluatedAt: new Date("2026-05-19") },
  { ...baseRecord, ticker: "MSFT", predictedDirection: "BUY", realizedReturn: 2.1, hitFlag: true, evaluatedAt: new Date("2026-05-18") },
  { ...baseRecord, ticker: "GOOGL", predictedDirection: "BUY", realizedReturn: 1.5, hitFlag: true, evaluatedAt: new Date("2026-05-17") },
  { ...baseRecord, ticker: "AMZN", predictedDirection: "BUY", realizedReturn: 5.3, hitFlag: true, evaluatedAt: new Date("2026-05-16") },
  { ...baseRecord, ticker: "TSLA", predictedDirection: "BUY", realizedReturn: 4.0, hitFlag: true, evaluatedAt: new Date("2026-05-15") },
  { ...baseRecord, ticker: "META", predictedDirection: "BUY", realizedReturn: 6.8, hitFlag: true, evaluatedAt: new Date("2026-05-14") },
  { ...baseRecord, ticker: "AAPL", predictedDirection: "BUY", realizedReturn: 2.9, hitFlag: true, evaluatedAt: new Date("2026-05-13") },
  { ...baseRecord, ticker: "NVDA", predictedDirection: "BUY", realizedReturn: 12.1, hitFlag: true, evaluatedAt: new Date("2026-05-12") },
  { ...baseRecord, ticker: "GOOGL", predictedDirection: "BUY", realizedReturn: 1.8, hitFlag: true, evaluatedAt: new Date("2026-05-11") },
  // === SELL hits (negative realizedReturn for sell = correct) ===
  { ...baseRecord, ticker: "TSLA", predictedDirection: "SELL", realizedReturn: -3.5, hitFlag: true, evaluatedAt: new Date("2026-05-10") },
  { ...baseRecord, ticker: "AAPL", predictedDirection: "SELL", realizedReturn: -2.1, hitFlag: true, evaluatedAt: new Date("2026-05-09") },
  { ...baseRecord, ticker: "NVDA", predictedDirection: "SELL", realizedReturn: -5.2, hitFlag: true, evaluatedAt: new Date("2026-05-08") },
  { ...baseRecord, ticker: "META", predictedDirection: "SELL", realizedReturn: -4.4, hitFlag: true, evaluatedAt: new Date("2026-05-07") },
  { ...baseRecord, ticker: "AMZN", predictedDirection: "SELL", realizedReturn: -1.9, hitFlag: true, evaluatedAt: new Date("2026-05-06") },
  // === FAILURES (hitFlag = false) ===
  { ...baseRecord, ticker: "NVDA", predictedDirection: "SELL", realizedReturn: 7.3, hitFlag: false, evaluatedAt: new Date("2026-05-05") },
  { ...baseRecord, ticker: "AAPL", predictedDirection: "SELL", realizedReturn: 4.1, hitFlag: false, evaluatedAt: new Date("2026-05-04") },
  { ...baseRecord, ticker: "TSLA", predictedDirection: "BUY", realizedReturn: -6.8, hitFlag: false, evaluatedAt: new Date("2026-05-03") },
  { ...baseRecord, ticker: "GOOGL", predictedDirection: "SELL", realizedReturn: 3.3, hitFlag: false, evaluatedAt: new Date("2026-05-02") },
  { ...baseRecord, ticker: "MSFT", predictedDirection: "SELL", realizedReturn: 1.2, hitFlag: false, evaluatedAt: new Date("2026-05-01") },
  { ...baseRecord, ticker: "AMZN", predictedDirection: "BUY", realizedReturn: -2.5, hitFlag: false, evaluatedAt: new Date("2026-04-30") },
  { ...baseRecord, ticker: "META", predictedDirection: "SELL", realizedReturn: 5.5, hitFlag: false, evaluatedAt: new Date("2026-04-29") },
  { ...baseRecord, ticker: "NVDA", predictedDirection: "BUY", realizedReturn: -3.1, hitFlag: false, evaluatedAt: new Date("2026-04-28") },
  { ...baseRecord, ticker: "AAPL", predictedDirection: "BUY", realizedReturn: -1.7, hitFlag: false, evaluatedAt: new Date("2026-04-27") },
  { ...baseRecord, ticker: "TSLA", predictedDirection: "SELL", realizedReturn: 8.2, hitFlag: false, evaluatedAt: new Date("2026-04-26") },
  // === Pending (null realizedReturn/hitFlag) ===
  { ...baseRecord, ticker: "NVDA", predictedDirection: "BUY", realizedReturn: null, hitFlag: null, evaluatedAt: null },
  { ...baseRecord, ticker: "AAPL", predictedDirection: "BUY", realizedReturn: null, hitFlag: null, evaluatedAt: null },
  { ...baseRecord, ticker: "GOOGL", predictedDirection: "SELL", realizedReturn: null, hitFlag: null, evaluatedAt: null },
  { ...baseRecord, ticker: "MSFT", predictedDirection: "BUY", realizedReturn: null, hitFlag: null, evaluatedAt: null },
  { ...baseRecord, ticker: "AMZN", predictedDirection: "SELL", realizedReturn: null, hitFlag: null, evaluatedAt: null },
];

/** Empty performance record list for empty-state UI testing. */
export const mockNoPerformanceRecords: PerformanceRecordCreateInput[] = [];
