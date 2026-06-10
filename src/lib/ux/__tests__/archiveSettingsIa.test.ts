import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(
  process.cwd(),
  "docs/ux/UX-012-archive-settings-information-architecture.md",
);

function readArchiveSettingsDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-012 archive and settings information architecture", () => {
  it("defines archive list field priority", () => {
    const doc = readArchiveSettingsDoc();

    [
      "ticker",
      "predictedDirection",
      "realizedReturn",
      "hitFlag",
      "evaluatedAt",
    ].forEach((field) => {
      expect(doc).toContain(field);
    });
  });

  it("defines ticker grouping, filtering, and sorting", () => {
    const doc = readArchiveSettingsDoc();

    ["ticker filter", "grouping", "latest first", "sorting"].forEach((rule) => {
      expect(doc).toContain(rule);
    });
  });

  it("defines success, failure, and return display rules", () => {
    const doc = readArchiveSettingsDoc();

    ["success", "failure", "수익률", "success/failure"].forEach((copy) => {
      expect(doc).toContain(copy);
    });
  });

  it("defines empty states and next actions", () => {
    const doc = readArchiveSettingsDoc();

    ["데이터 축적 중", "empty state", "settings", "watchlist"].forEach(
      (state) => {
        expect(doc).toContain(state);
      },
    );
  });

  it("maps downstream implementation tasks", () => {
    const doc = readArchiveSettingsDoc();

    ["ARC-Q01", "ARC-Q02", "ONB-Q02"].forEach((taskId) => {
      expect(doc).toContain(taskId);
    });
  });
});
