import type { ClientEventName } from "@/lib/dto/posthogEvents";

export type RecommendationActionPage = "home" | "detail";

export interface RecommendationActionInput {
  recId: string;
  ticker: string;
  riskMode: string;
  page: RecommendationActionPage;
}

export type CaptureClientEvent = (
  event: ClientEventName,
  properties?: Record<string, string | number | boolean | null>,
) => Promise<void>;

export function recommendationEventProperties(input: RecommendationActionInput) {
  return {
    recId: input.recId,
    ticker: input.ticker,
    riskMode: input.riskMode,
    page: input.page,
  };
}

export async function captureBookmarkAdd(
  input: RecommendationActionInput,
  capture: CaptureClientEvent,
) {
  await capture("bookmark_add", recommendationEventProperties(input));
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
