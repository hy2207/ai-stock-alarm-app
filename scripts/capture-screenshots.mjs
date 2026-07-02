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
    await pg.goto(BASE_URL);
    await pg.waitForLoadState("networkidle");
    await shot(pg, "landing", 1500);
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

  // ── 1. Home (cards) ───────────────────────────────────────────────────────
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  // Wait for cards to render (TodayCardAutoLoader may trigger generate)
  await page.waitForSelector("article", { timeout: 30_000 }).catch(() => {});
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "home", 800);

  // ── 2. Home — news block ──────────────────────────────────────────────────
  const newsBlock = page.locator(".bg-blue-50").first();
  if (await newsBlock.count()) {
    await newsBlock.scrollIntoViewIfNeeded();
    await shot(page, "home-news", 600);
  } else {
    console.log("⚠  news block not found — skipping home-news.png");
  }

  // ── 3 & 4. Detail + detail news ───────────────────────────────────────────
  await page.goto(BASE_URL);
  await page.waitForLoadState("networkidle");
  await page.waitForSelector('a[href^="/recommendations/"]', { timeout: 15_000 }).catch(() => {});
  const detailHref = await page.locator('a[href^="/recommendations/"]').first().getAttribute("href").catch(() => null);

  if (detailHref) {
    await page.goto(BASE_URL + detailHref);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await shot(page, "detail", 600);

    const dNews = page.locator(".bg-blue-50").first();
    if (await dNews.count()) {
      await dNews.scrollIntoViewIfNeeded();
      await shot(page, "detail-news", 600);
    }
  } else {
    console.log("⚠  no detail link found — skipping detail shots");
  }

  // ── 5. Settings hub ───────────────────────────────────────────────────────
  await page.goto(BASE_URL + "/settings");
  await page.waitForLoadState("networkidle");
  await shot(page, "settings", 1000);

  // ── 6. Watchlist: top of page ─────────────────────────────────────────────
  await page.goto(BASE_URL + "/settings/watchlist");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await shot(page, "settings-watchlist", 600);

  // ── 7. Watchlist: search dropdown ─────────────────────────────────────────
  // Remove one chip so the search input becomes enabled (maxReached=false)
  const removeBtn = page.locator('button[aria-label$=" 제거"]').first();
  if (await removeBtn.count()) {
    await removeBtn.click();
    await page.waitForTimeout(400);
  }
  const searchInput = page.locator('input[type="text"]:not([disabled])').first();
  if (await searchInput.count()) {
    await searchInput.click();
    await searchInput.fill("APPL");
    await page.waitForTimeout(800);
    await shot(page, "settings-watchlist-search", 400);
    await searchInput.fill("");
    await page.waitForTimeout(300);
  } else {
    console.log("⚠  search input still disabled — skipping search screenshot");
  }

  // ── 8. Watchlist: top-50 grid ─────────────────────────────────────────────
  const grid = page.locator(".grid").first();
  if (await grid.count()) {
    await grid.scrollIntoViewIfNeeded();
    await shot(page, "settings-watchlist-grid", 600);
  }

  await browser.close();
  console.log("\n✅ 완료! 저장 위치: " + OUT_DIR);
})();
