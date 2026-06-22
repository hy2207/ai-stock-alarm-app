import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import LoginPage from "../page";
import { getSafeCallbackUrl } from "../utils";

describe("AUTH-Q01 login page", () => {
  it("renders Google and Kakao login choices", () => {
    const html = renderToStaticMarkup(<LoginPage searchParams={{}} />);

    expect(html).toContain("Google로 계속하기");
    expect(html).toContain("Kakao로 계속하기");
    expect(html).not.toContain("이메일로 계속하기");
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

  it("keeps safe internal callback destinations", () => {
    expect(getSafeCallbackUrl("/recommendations/rec_123")).toBe(
      "/recommendations/rec_123",
    );
    expect(getSafeCallbackUrl("/settings")).toBe("/settings");
  });

  it("rejects unsafe or external callback destinations", () => {
    expect(getSafeCallbackUrl("https://example.com")).toBe("/");
    expect(getSafeCallbackUrl("//example.com")).toBe("/");
    expect(getSafeCallbackUrl("javascript:alert(1)")).toBe("/");
    expect(getSafeCallbackUrl(undefined)).toBe("/");
  });

  it("passes the safe callbackUrl to the provider buttons", () => {
    const html = renderToStaticMarkup(
      <LoginPage searchParams={{ callbackUrl: "/archive" }} />,
    );

    expect(html).toContain('data-callback-url="/archive"');
  });
});
