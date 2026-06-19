import { describe, expect, it } from "vitest";
import {
  captureAlertSet,
  captureBookmarkAdd,
  captureBrokerRedirect,
  capturePriceCopy,
  captureReasonExpand,
  formatEntryPriceText,
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
  it("GWT: Given a single entry price When formatting copy text Then returns executable price", () => {
    expect(
      formatEntryPriceText({
        entryPrice: 185.12,
        entryRangeLow: null,
        entryRangeHigh: null,
      }),
    ).toBe("$185.12");
  });

  it("GWT: Given an entry range When formatting copy text Then returns executable range", () => {
    expect(
      formatEntryPriceText({
        entryPrice: null,
        entryRangeLow: 181,
        entryRangeHigh: 184.5,
      }),
    ).toBe("$181.00-$184.50");
  });

  it("GWT: Given recommendation context When building properties Then includes stable analytics fields", () => {
    expect(recommendationEventProperties(action)).toEqual({
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
    });
  });

  it("GWT: Given price copy action When captured Then sends price_copy with clipboard availability", async () => {
    const { calls, capture } = captureMock();

    await capturePriceCopy(action, capture, true);

    expect(calls).toEqual([["price_copy", {
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
      clipboardAvailable: true,
    }]]);
  });

  it("GWT: Given alert action When captured Then sends alert_set with recommendation context", async () => {
    const { calls, capture } = captureMock();

    await captureAlertSet(action, capture);

    expect(calls).toEqual([["alert_set", {
      recId: "clxrecommendation123",
      ticker: "AAPL",
      riskMode: "balanced",
      page: "detail",
    }]]);
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

  it("GWT: Given broker CTA When captured Then records intent before broker_redirect", async () => {
    const { calls, capture } = captureMock();

    await captureBrokerRedirect(action, capture);

    expect(calls).toEqual([
      [
        "execution_intent_submit",
        {
          recId: "clxrecommendation123",
          ticker: "AAPL",
          riskMode: "balanced",
          page: "detail",
        },
      ],
      [
        "broker_redirect",
        {
          recId: "clxrecommendation123",
          ticker: "AAPL",
          riskMode: "balanced",
          page: "detail",
          destination: "external_broker_pending",
        },
      ],
    ]);
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
