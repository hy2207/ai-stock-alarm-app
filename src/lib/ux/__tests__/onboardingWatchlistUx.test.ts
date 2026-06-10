import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(
  process.cwd(),
  "docs/ux/UX-006-onboarding-watchlist-settings-ux.md",
);

function readOnboardingWatchlistDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-006 onboarding and watchlist settings UX", () => {
  it("defines the onboarding selection UI and CTA states", () => {
    const doc = readOnboardingWatchlistDoc();

    ["onboarding", "ticker", "sector", "continue CTA", "home CTA"].forEach(
      (term) => {
        expect(doc).toContain(term);
      },
    );
  });

  it("defines selected, unselected, and disabled item states", () => {
    const doc = readOnboardingWatchlistDoc();

    ["selected", "unselected", "disabled", "deselected"].forEach((state) => {
      expect(doc).toContain(state);
    });
  });

  it("defines min and max selection limits with copy", () => {
    const doc = readOnboardingWatchlistDoc();

    ["minimum 1", "maximum 3", "최대 3개까지 선택 가능합니다", "1개 이상"].forEach(
      (limitRule) => {
        expect(doc).toContain(limitRule);
      },
    );
  });

  it("defines settings edit and save feedback flow", () => {
    const doc = readOnboardingWatchlistDoc();

    ["settings", "existing watchlist", "save success", "save failure"].forEach(
      (flow) => {
        expect(doc).toContain(flow);
      },
    );
  });

  it("maps downstream onboarding implementation tasks", () => {
    const doc = readOnboardingWatchlistDoc();

    ["ONB-Q01", "ONB-Q02", "ONB-C01", "ONB-C02"].forEach((taskId) => {
      expect(doc).toContain(taskId);
    });
  });
});
