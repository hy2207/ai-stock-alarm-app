import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(
  process.cwd(),
  "docs/ux/UX-003-design-system-foundation.md",
);

function readDesignSystemDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-003 design system foundation", () => {
  it("defines the Tailwind and shadcn/ui implementation foundation", () => {
    const doc = readDesignSystemDoc();

    expect(doc).toContain("Tailwind CSS");
    expect(doc).toContain("shadcn/ui");
  });

  it("documents the required design token groups", () => {
    const doc = readDesignSystemDoc();

    ["color", "typography", "spacing", "radius", "border", "elevation"].forEach(
      (tokenGroup) => {
        expect(doc).toContain(tokenGroup);
      },
    );
  });

  it("selects reusable component patterns for downstream screens", () => {
    const doc = readDesignSystemDoc();

    ["Button", "Card", "Table", "Tabs", "Segmented Control", "Alert"].forEach(
      (componentName) => {
        expect(doc).toContain(componentName);
      },
    );
  });

  it("covers all required state styles", () => {
    const doc = readDesignSystemDoc();

    ["success", "failure", "No Call", "loading", "disabled", "focus", "selected"].forEach(
      (stateName) => {
        expect(doc).toContain(stateName);
      },
    );
  });

  it("preserves Decision Layer product constraints", () => {
    const doc = readDesignSystemDoc();

    [
      "actionable card first",
      "aggressive",
      "balanced",
      "conservative",
      "success/failure",
      "Trust Layer",
      "candle",
      "RSI",
      "MACD",
    ].forEach((constraint) => {
      expect(doc).toContain(constraint);
    });
  });
});
