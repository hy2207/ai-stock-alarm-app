import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const docPath = resolve(process.cwd(), "docs/ux/UX-005-auth-session-ux.md");

function readAuthSessionUxDoc() {
  return readFileSync(docPath, "utf8");
}

describe("UX-005 auth and session UX spec", () => {
  it("defines login choices and CTA priority", () => {
    const doc = readAuthSessionUxDoc();

    ["Google", "Kakao", "email", "primary CTA", "secondary CTA"].forEach(
      (copy) => {
        expect(doc).toContain(copy);
      },
    );
  });

  it("defines protected route fallback behavior", () => {
    const doc = readAuthSessionUxDoc();

    ["/login", "protected route", "returnTo", "safe internal"].forEach(
      (fallbackRule) => {
        expect(doc).toContain(fallbackRule);
      },
    );
  });

  it("covers session expiration, refresh failure, and re-login states", () => {
    const doc = readAuthSessionUxDoc();

    ["session expired", "refresh failed", "re-login"].forEach((state) => {
      expect(doc).toContain(state);
    });
  });

  it("prohibits sensitive auth information exposure", () => {
    const doc = readAuthSessionUxDoc();

    ["OAuth token", "provider payload", "user identifier", "secret"].forEach(
      (sensitiveTerm) => {
        expect(doc).toContain(sensitiveTerm);
      },
    );
  });

  it("maps downstream auth implementation tasks", () => {
    const doc = readAuthSessionUxDoc();

    ["AUTH-Q01", "AUTH-C02", "AUTH-C03"].forEach((taskId) => {
      expect(doc).toContain(taskId);
    });
  });
});
