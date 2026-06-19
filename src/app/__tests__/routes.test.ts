import { describe, expect, it } from "vitest";
import { getRouteFromHash, ROUTES } from "../routes";

describe("hash route parsing", () => {
  it("GWT: Given push deeplink query When parsing hash route Then keeps recommendation detail route", () => {
    expect(getRouteFromHash("#/recommendations/aapl-balanced?from=push")).toBe(
      "/recommendations/aapl-balanced",
    );
  });

  it("GWT: Given OneSignal source query When parsing home hash Then keeps home route", () => {
    expect(getRouteFromHash("#/app?utm_source=onesignal")).toBe(ROUTES.home);
  });

  it("GWT: Given invalid push route When parsing hash Then falls back to landing", () => {
    expect(getRouteFromHash("#/missing?from=push")).toBe(ROUTES.landing);
  });
});
