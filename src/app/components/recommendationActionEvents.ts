import type { ClientEventName } from "@/lib/dto/posthogEvents";

export type RecommendationActionPage = "home" | "detail";

export interface RecommendationActionInput {
  recId: string;
  ticker: string;
  riskMode: string;
  page: RecommendationActionPage;
}

export interface EntryPriceInput {
  entryPrice: number | null;
  entryRangeLow: number | null;
  entryRangeHigh: number | null;
}

export type CaptureClientEvent = (
  event: ClientEventName,
  properties?: Record<string, string | number | boolean | null>,
) => Promise<void>;

export function formatEntryPriceText(input: EntryPriceInput) {
  if (input.entryPrice != null) return `$${input.entryPrice.toFixed(2)}`;
  if (input.entryRangeLow != null && input.entryRangeHigh != null) {
    return `$${input.entryRangeLow.toFixed(2)}-$${input.entryRangeHigh.toFixed(2)}`;
  }
  if (input.entryRangeLow != null) return `$${input.entryRangeLow.toFixed(2)} 이상`;
  if (input.entryRangeHigh != null) return `$${input.entryRangeHigh.toFixed(2)} 이하`;
  return "가격 확인 필요";
}

export function recommendationEventProperties(input: RecommendationActionInput) {
  return {
    recId: input.recId,
    ticker: input.ticker,
    riskMode: input.riskMode,
    page: input.page,
  };
}

export async function capturePriceCopy(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
  clipboardAvailable: boolean,
) {
  await capture("price_copy", {
    ...recommendationEventProperties(input),
    clipboardAvailable,
  });
}

export async function captureAlertSet(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
) {
  await capture("alert_set", recommendationEventProperties(input));
}

export async function captureBookmarkAdd(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
) {
  await capture("bookmark_add", recommendationEventProperties(input));
}

export async function captureBrokerRedirect(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
) {
  const properties = recommendationEventProperties(input);
  await capture("execution_intent_submit", properties);
  await capture("broker_redirect", {
    ...properties,
    destination: "external_broker_pending",
  });
}

export async function captureReasonExpand(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
  expanded: boolean,
) {
  await capture("reason_expand", {
    ...recommendationEventProperties(input),
    expanded,
  });
}
