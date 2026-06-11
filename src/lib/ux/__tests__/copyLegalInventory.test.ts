import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(
  process.cwd(),
  "docs/ux/UX-014-copy-legal-microcopy-inventory.md",
);

function readCopyInventoryDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-014 copy, legal, and microcopy inventory", () => {
  it("defines the required legal disclaimer copy", () => {
    const doc = readCopyInventoryDoc();

    expect(doc).toContain("투자 참고용 정보이며 투자 자문이 아닙니다");
    expect(doc).toContain("legal.disclaimer.investment_advice");
  });

  it("covers onboarding selection limits and save outcomes", () => {
    const doc = readCopyInventoryDoc();

    [
      "watchlist.limit.max_3",
      "watchlist.empty.required",
      "watchlist.save.success",
      "watchlist.save.failure",
    ].forEach((copyKey) => {
      expect(doc).toContain(copyKey);
    });
  });

  it("covers No Call, data shortage, LLM failure, and trust empty states", () => {
    const doc = readCopyInventoryDoc();

    [
      "recommendation.no_call",
      "recommendation.data_shortage",
      "recommendation.llm_failure",
      "trust.history.empty",
      "데이터 축적 중",
    ].forEach((copyKey) => {
      expect(doc).toContain(copyKey);
    });
  });

  it("covers auth, session, privacy, and push permission copy", () => {
    const doc = readCopyInventoryDoc();

    [
      "auth.login.required",
      "auth.session.expired",
      "privacy.data_minimized",
      "push.permission.request",
      "push.permission.denied",
    ].forEach((copyKey) => {
      expect(doc).toContain(copyKey);
    });
  });

  it("sets the tone for transparent success/failure performance copy", () => {
    const doc = readCopyInventoryDoc();

    expect(doc).toContain("success/failure");
    expect(doc).toContain("실패 기록도 숨기지 않습니다");
    expect(doc).toContain("legal review required");
  });
});
