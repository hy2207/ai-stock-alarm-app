import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(process.cwd(), "docs/ux/UX-002-user-journey-ia.md");

function readJourneyDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-002 user journey and IA inventory", () => {
  it("defines all v1 screen IDs required by downstream work", () => {
    const doc = readJourneyDoc();

    [
      "SCR-LOGIN",
      "SCR-ONBOARDING",
      "SCR-HOME",
      "SCR-RECOMMENDATION-DETAIL",
      "SCR-SETTINGS",
      "SCR-ARCHIVE",
      "SCR-PUSH-LANDING",
      "SCR-EMPTY-STATE",
      "SCR-ERROR-STATE",
    ].forEach((screenId) => {
      expect(doc).toContain(screenId);
    });
  });

  it("documents entry, exit, protection, and empty-state handling per screen", () => {
    const doc = readJourneyDoc();

    expect(doc).toContain("Entry condition");
    expect(doc).toContain("Exit condition");
    expect(doc).toContain("Protected route");
    expect(doc).toContain("Empty or error state");
  });

  it("anchors auth fallback, push deeplinks, and Decision Layer flows", () => {
    const doc = readJourneyDoc();

    [
      "Unauthenticated fallback",
      "Push deeplink fallback",
      "New user journey",
      "Returning user journey",
      "Decision Layer review",
    ].forEach((flowName) => {
      expect(doc).toContain(flowName);
    });
  });

  it("preserves Decision Layer product constraints", () => {
    const doc = readJourneyDoc();

    [
      "aggressive",
      "balanced",
      "conservative",
      "1~10 days",
      "3~5 business days",
      "160 characters or less",
      "legal disclaimer",
      "success/failure",
    ].forEach((constraint) => {
      expect(doc).toContain(constraint);
    });

    expect(doc).toContain("excludes candle charts, RSI, MACD");
  });

  it("maps downstream implementation tasks to screen IDs", () => {
    const doc = readJourneyDoc();

    ["AUTH-Q01", "ONB-Q01", "REC-Q03", "PUSH-Q01", "ARC-Q02"].forEach(
      (taskId) => {
        expect(doc).toContain(taskId);
      },
    );
  });
});
