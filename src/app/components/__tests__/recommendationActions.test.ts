import { describe, expect, it } from "vitest";
import {
  captureBookmarkAdd,
  captureReasonExpand,
  recommendationEventProperties,
  type CaptureClientEvent,
  type RecommendationActionInput,
} from "../recommendationActionEvents";

const action: RecommendationActionInput = {
  recId: "clxrecommendation123",
  ticker: "AAPL",
  riskMode: "balanced",
  page: "detail",
};

function captureMock() {
  const calls: Array<Parameters<CaptureClientEvent>> = [];
  const capture: CaptureClientEvent = async (...args) => {
    calls.push(args);
  };

  return { calls, capture };
}

describe("recommendation action event helpers", () => {
  it("GWT: Given recommendation context When building properties Then includes stable analytics fields", () => {
    expect(recommendationEventProperties(action)).toEqual({
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
    });
  });

  it("GWT: Given bookmark action When captured Then sends bookmark_add with recommendation context", async () => {
    const { calls, capture } = captureMock();

    await captureBookmarkAdd(action, capture);

    expect(calls).toEqual([["bookmark_add", {
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
    }]]);
  });

  it("GWT: Given reason toggle When expanded Then sends reason_expand state", async () => {
    const { calls, capture } = captureMock();

    await captureReasonExpand(action, capture, true);

    expect(calls).toEqual([["reason_expand", {
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
      expanded: true,
    }]]);
  });
});
