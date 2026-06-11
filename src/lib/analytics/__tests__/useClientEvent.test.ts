import { describe, it, expect, vi, beforeEach } from "vitest";
import { createClientEventCapturers } from "../useClientEvent";

describe("createClientEventCapturers", () => {
  const capture = vi.fn();
  const cap = createClientEventCapturers(capture);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captureHomeView sends home_view event", () => {
    cap.captureHomeView({ source: "push" });
    expect(capture).toHaveBeenCalledWith("home_view", { source: "push" });
  });

  it("captureHomeView omits optional source", () => {
    cap.captureHomeView();
    expect(capture).toHaveBeenCalledWith("home_view", undefined);
  });

  it("captureRecCardImpression sends rec_card_impression", () => {
    cap.captureRecCardImpression({
      cardId: "c1", ticker: "AAPL", direction: "BUY",
      confidenceScore: "aggressive", positionType: "long", holdDays: 5,
    });
    expect(capture).toHaveBeenCalledWith("rec_card_impression", expect.objectContaining({ cardId: "c1", ticker: "AAPL" }));
  });

  it("captureRecCardClick sends rec_card_click", () => {
    cap.captureRecCardClick({ cardId: "c1", ticker: "NVDA", direction: "BUY" });
    expect(capture).toHaveBeenCalledWith("rec_card_click", { cardId: "c1", ticker: "NVDA", direction: "BUY" });
  });

  it("captureRecDetailView sends rec_detail_view", () => {
    cap.captureRecDetailView({ cardId: "c1", ticker: "TSLA" });
    expect(capture).toHaveBeenCalledWith("rec_detail_view", { cardId: "c1", ticker: "TSLA" });
  });

  it("captureBookmarkAdd sends bookmark_add", () => {
    cap.captureBookmarkAdd({ cardId: "c1", ticker: "GOOGL" });
    expect(capture).toHaveBeenCalledWith("bookmark_add", { cardId: "c1", ticker: "GOOGL" });
  });

  it("captureAlertSet sends alert_set", () => {
    cap.captureAlertSet({ ticker: "AAPL", alertType: "above", targetPrice: 200 });
    expect(capture).toHaveBeenCalledWith("alert_set", { ticker: "AAPL", alertType: "above", targetPrice: 200 });
  });

  it("captureBrokerRedirect sends broker_redirect", () => {
    cap.captureBrokerRedirect({ ticker: "MSFT", broker: "etrade", action: "buy" });
    expect(capture).toHaveBeenCalledWith("broker_redirect", { ticker: "MSFT", broker: "etrade", action: "buy" });
  });

  it("capturePriceCopy sends price_copy", () => {
    cap.capturePriceCopy({ ticker: "AMZN", price: 178.5, priceType: "entry" });
    expect(capture).toHaveBeenCalledWith("price_copy", { ticker: "AMZN", price: 178.5, priceType: "entry" });
  });

  it("captureExecutionIntentSubmit sends execution_intent_submit", () => {
    cap.captureExecutionIntentSubmit({ ticker: "NVDA", direction: "BUY", quantity: 10, orderType: "market" });
    expect(capture).toHaveBeenCalledWith("execution_intent_submit", expect.objectContaining({ ticker: "NVDA" }));
  });

  it("captureConfidenceView sends confidence_view", () => {
    cap.captureConfidenceView({ cardId: "c1" });
    expect(capture).toHaveBeenCalledWith("confidence_view", { cardId: "c1" });
  });

  it("captureConfidenceChange sends confidence_change with from/to", () => {
    cap.captureConfidenceChange({ cardId: "c1", from: "aggressive", to: "balanced" });
    expect(capture).toHaveBeenCalledWith("confidence_change", { cardId: "c1", from: "aggressive", to: "balanced" });
  });

  it("capturePerformanceCardView sends performance_card_view", () => {
    cap.capturePerformanceCardView({ cardId: "c1" });
    expect(capture).toHaveBeenCalledWith("performance_card_view", { cardId: "c1" });
  });

  it("captureReasonExpand sends reason_expand", () => {
    cap.captureReasonExpand({ cardId: "c1", reasonCount: 3 });
    expect(capture).toHaveBeenCalledWith("reason_expand", { cardId: "c1", reasonCount: 3 });
  });

  it("capturePushOpen sends push_open", () => {
    cap.capturePushOpen({ pushId: "push-1", campaignType: "morning_briefing" });
    expect(capture).toHaveBeenCalledWith("push_open", { pushId: "push-1", campaignType: "morning_briefing" });
  });

  it("captureDeeplinkSuccess sends deeplink_success", () => {
    cap.captureDeeplinkSuccess({ target: "/today", latency: 350 });
    expect(capture).toHaveBeenCalledWith("deeplink_success", { target: "/today", latency: 350 });
  });

  it("captureDeeplinkFail sends deeplink_fail", () => {
    cap.captureDeeplinkFail({ target: "/detail/abc", reason: "not_found" });
    expect(capture).toHaveBeenCalledWith("deeplink_fail", { target: "/detail/abc", reason: "not_found" });
  });
});
