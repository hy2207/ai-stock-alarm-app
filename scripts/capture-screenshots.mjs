/**
 * Headless screenshot capture — no manual login required.
 * Generates a valid NextAuth session JWT and injects it as a cookie.
 *
 * Run: node scripts/capture-screenshots.mjs
 */

import { chromium } from "playwright";
import { encode } from "next-auth/jwt";
import { mkdirSync } from "fs";

const BASE_URL = "http://localhost:3000";
const OUT_DIR = new URL("../public/screenshots/", import.meta.url).pathname;
const NEXTAUTH_SECRET = "6TtM4hQqW8F0vHj1eX9KZ7rP2nLcA5uB3sYdGkNfJ0I=";
const USER_ID = "cmqs18o450000la05ipd2bcy0";
const USER_EMAIL = "hy3980@gmail.com";

mkdirSync(OUT_DIR, { recursive: true });

async function shot(page, name, waitMs = 1200) {
  await page.waitForTimeout(waitMs);
  await page.screenshot({ path: OUT_DIR + name + ".png", fullPage: false });
  console.log("✓ " + name + ".png");
}

(async () => {
  // Forge a valid NextAuth session JWT
  const sessionToken = await encode({
    token: {
      sub: USER_ID,
      email: USER_EMAIL,
      name: "HY",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    secret: NEXTAUTH_SECRET,
  });

  const browser = await chromium.launch({ headless: true });

  // ── 0. Landing page (unauthenticated) ─────────────────────────────────────
  {
    const ctx = await browser.newContext({ viewport: { width: 430, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto(BASE_URL, { waitUntil: "domcontentloaded" });
    await shot(pg, "landing", 3000);
    await ctx.close();
  }

  // All authenticated pages share one context with the session cookie
  const context = await browser.newContext({ viewport: { width: 430, height: 900 } });
  await context.addCookies([{
    name: "next-auth.session-token",
    value: sessionToken,
    domain: "localhost",
    path: "/",
    httpOnly: true,
    sameSite: "Lax",
    expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  }]);

  const page = await context.newPage();

  // ── 1. 오늘 추천 (cards) ──────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/today`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("article", { timeout: 60_000 }).catch(() => {});
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "today", 800);

  // ── 2. 오늘 추천 — news block ─────────────────────────────────────────────
  const newsBlock = page.locator(".bg-blue-50").first();
  if (await newsBlock.count()) {
    await newsBlock.scrollIntoViewIfNeeded();
    await shot(page, "today-news", 600);
  } else {
    console.log("⚠  news block not found — skipping today-news.png");
  }

  // ── 3 & 4. Detail: scenario forecast + chart overlay ─────────────────────
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const detailHref = await page
    .locator('a[href^="/recommendations/"]')
    .first()
    .getAttribute("href")
    .catch(() => null);

  if (detailHref) {
    await page.goto(BASE_URL + detailHref, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);

    const forecastSection = page.locator("text=일 후 전망").first();
    if (await forecastSection.count()) {
      await forecastSection.scrollIntoViewIfNeeded();
      await shot(page, "detail-forecast", 800);
    }

    const chartSection = page.locator("text=가격 추이").first();
    if (await chartSection.count()) {
      await chartSection.scrollIntoViewIfNeeded();
      await shot(page, "detail-chart", 3000); // let recharts settle
    }
  } else {
    console.log("⚠  no detail link found — skipping detail shots");
  }

  // ── 5. AI 예측 정확도 (archive trust view) ────────────────────────────────
  await page.goto(`${BASE_URL}/archive`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(3000);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "archive-trust", 800);

  // ── 6. Settings hub ───────────────────────────────────────────────────────
  await page.goto(`${BASE_URL}/settings`, { waitUntil: "domcontentloaded" });
  await shot(page, "settings", 2000);

  // ── 7. Watchlist: top of page ─────────────────────────────────────────────
  await page.goto(`${BASE_URL}/settings/watchlist`, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "settings-watchlist", 600);

  // ── 8. Watchlist: search dropdown ─────────────────────────────────────────
  const removeBtn = page.locator('button[aria-label$=" 제거"]').first();
  if (await removeBtn.count()) {
    await removeBtn.click();
    await page.waitForTimeout(400);
  }
  const searchInput = page.locator('input[type="text"]:not([disabled])').first();
  if (await searchInput.count()) {
    await searchInput.click();
    await searchInput.fill("APPL");
    await page.waitForTimeout(900);
    await shot(page, "settings-watchlist-search", 400);
  } else {
    console.log("⚠  search input disabled — skipping search screenshot");
  }

  await browser.close();
  console.log("\n✅ 완료! 저장 위치: " + OUT_DIR);
})();
