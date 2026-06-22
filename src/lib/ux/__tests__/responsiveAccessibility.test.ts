import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(
  process.cwd(),
  "docs/ux/UX-004-responsive-accessibility-baseline.md",
);

function readResponsiveAccessibilityDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-004 responsive and accessibility baseline", () => {
  it("defines mobile, tablet, and desktop viewport baselines", () => {
    const doc = readResponsiveAccessibilityDoc();

    ["mobile", "tablet", "desktop", "360px", "768px", "1024px"].forEach(
      (viewport) => {
        expect(doc).toContain(viewport);
      },
    );
  });

  it("covers responsive rules for Decision Layer surfaces", () => {
    const doc = readResponsiveAccessibilityDoc();

    [
      "recommendation card",
      "risk mode toggle",
      "CTA",
      "performance card",
      "archive table",
    ].forEach((surface) => {
      expect(doc).toContain(surface);
    });
  });

  it("defines keyboard, focus, label, and screen reader standards", () => {
    const doc = readResponsiveAccessibilityDoc();

    ["keyboard", "focus ring", "aria-label", "screen reader"].forEach(
      (standard) => {
        expect(doc).toContain(standard);
      },
    );
  });

  it("defines contrast, touch target, and visible error standards", () => {
    const doc = readResponsiveAccessibilityDoc();

    ["contrast", "44px", "touch target", "visible error"].forEach(
      (standard) => {
        expect(doc).toContain(standard);
      },
    );
  });

  it("links the checklist to UX-016 design QA and product guardrails", () => {
    const doc = readResponsiveAccessibilityDoc();

    ["UX-016", "candle", "RSI", "MACD", "Trust Layer"].forEach((guardrail) => {
      expect(doc).toContain(guardrail);
    });
  });
});
