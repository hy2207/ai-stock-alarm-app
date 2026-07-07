import { describe, it, expect } from "vitest";
import { recommendationCardCreateSchema } from "../../dto/recommendationCard";
import {
  mockAggressiveCard,
  mockBalancedCard,
  mockConservativeCard,
  mockNoCallCard,
} from "../recommendation";

describe("mockAggressiveCard", () => {
  it("passes Zod validation", () => {
    const result = recommendationCardCreateSchema.safeParse(mockAggressiveCard);
    expect(result.success).toBe(true);
  });

  it("has correct values", () => {
    expect(mockAggressiveCard.ticker).toBe("NVDA");
    expect(mockAggressiveCard.direction).toBe("BUY");
    expect(mockAggressiveCard.confidenceScore).toBe("aggressive");
    expect(mockAggressiveCard.status).toBe("published");
    expect(mockAggressiveCard.entryPrice).toBe(890.5);
    expect(mockAggressiveCard.holdDays).toBe(5);
  });
});

describe("mockBalancedCard", () => {
  it("passes Zod validation", () => {
    const result = recommendationCardCreateSchema.safeParse(mockBalancedCard);
    expect(result.success).toBe(true);
  });

  it("has entry range and target range", () => {
    expect(mockBalancedCard.exitPrice).toBe(175.0);
  });
});

describe("mockConservativeCard", () => {
  it("passes Zod validation", () => {
    const result = recommendationCardCreateSchema.safeParse(
      mockConservativeCard,
    );
    expect(result.success).toBe(true);
  });

  it("has conservative confidence and 10-day hold", () => {
    expect(mockConservativeCard.holdDays).toBe(10);
    expect(mockConservativeCard.confidenceScore).toBe("conservative");
    expect(mockConservativeCard.ticker).toBe("MSFT");
  });
});

describe("mockNoCallCard", () => {
  it("passes Zod validation", () => {
    const result = recommendationCardCreateSchema.safeParse(mockNoCallCard);
    expect(result.success).toBe(true);
  });

  it("has no_call status", () => {
    expect(mockNoCallCard.status).toBe("no_call");
    expect(mockNoCallCard.ticker).toBe("TSLA");
  });
});
