import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LoginPage from "../page";
import { getSafeReturnTo } from "../utils";

describe("AUTH-Q01 login page", () => {
  it("renders Google, Kakao, and email login choices", () => {
    const html = renderToStaticMarkup(<LoginPage searchParams={{}} />);

    expect(html).toContain("Google로 계속하기");
    expect(html).toContain("Kakao로 계속하기");
    expect(html).toContain("이메일로 계속하기");
    expect(html).toContain('type="email"');
  });

  it("explains protected route fallback and privacy without exposing secrets", () => {
    const html = renderToStaticMarkup(<LoginPage searchParams={{}} />);

    expect(html).toContain("추천을 보려면 로그인이 필요합니다");
    expect(html).toContain("서비스 제공에 필요한 최소 정보만 저장합니다");
    expect(html).toContain("투자 참고용 정보이며 투자 자문이 아닙니다");
    expect(html).not.toContain("OAuth token");
    expect(html).not.toContain("provider payload");
    expect(html).not.toContain("secret");
  });

  it("keeps safe internal returnTo destinations", () => {
    expect(getSafeReturnTo("/recommendations/rec_123")).toBe(
      "/recommendations/rec_123",
    );
    expect(getSafeReturnTo("/settings")).toBe("/settings");
  });

  it("rejects unsafe or external returnTo destinations", () => {
    expect(getSafeReturnTo("https://example.com")).toBe("/");
    expect(getSafeReturnTo("//example.com")).toBe("/");
    expect(getSafeReturnTo("javascript:alert(1)")).toBe("/");
    expect(getSafeReturnTo(undefined)).toBe("/");
  });

  it("uses the safe returnTo as the NextAuth callback URL", () => {
    const html = renderToStaticMarkup(
      <LoginPage searchParams={{ returnTo: "/archive" }} />,
    );

    expect(html).toContain('name="callbackUrl"');
    expect(html).toContain('value="/archive"');
  });
});
