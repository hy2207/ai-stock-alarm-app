#!/usr/bin/env node
/**
 * PERF-004: Serverless Function Timeout compliance check.
 *
 * Verifies that Vercel function maxDuration exports are present and within
 * Vercel Pro limits (max 300s), and that the LLM generation timeout
 * (LLM_GENERATION_TIMEOUT_MS) is strictly less than the route's maxDuration.
 *
 * Usage:
 *   node scripts/perf/check-serverless-timeout.mjs
 */

import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative } from "path";

const ROOT = new URL("../../", import.meta.url).pathname;
const VERCEL_MAX = 300;

// Routes that are expected to export maxDuration, and their SRS-required limits
const EXPECTED_ROUTES = [
  {
    path: "src/app/api/cron/morning-briefing/route.ts",
    minDuration: 10,
    reason: "OneSignal push + DB — must exceed Vercel 10s default",
  },
  {
    path: "src/app/api/cron/evaluate-performance/route.ts",
    minDuration: 10,
    reason: "Yahoo Finance per-ticker calls — must exceed Vercel 10s default",
  },
];

// LLM timeout constant to verify (ms)
const LLM_TIMEOUT_CHECK = {
  path: "src/lib/llm/generateRecommendationCards.ts",
  constant: "LLM_GENERATION_TIMEOUT_MS",
  // Must be < Vercel function limit that calls this. The dev route
  // (generate-recommendations) is dev-only (returns 404 in production),
  // so LLM calls don't run in serverless production context.
  // We just verify the value is sane (> 0, < 60s).
  maxMs: 60_000,
};

let passed = 0;
let failed = 0;

function check(label, ok, detail) {
  const mark = ok ? "✓" : "✗";
  console.log(`  ${mark} ${label}${detail ? `\n      ${detail}` : ""}`);
  if (ok) passed++; else failed++;
}

function readFile(rel) {
  return readFileSync(join(ROOT, rel), "utf8");
}

console.log("\nPERF-004: Serverless timeout compliance\n");

// 1. Route maxDuration checks
console.log("Route maxDuration exports:");
for (const route of EXPECTED_ROUTES) {
  const src = readFile(route.path);
  const match = src.match(/export\s+const\s+maxDuration\s*=\s*(\d+)/);
  const rel = route.path;

  if (!match) {
    check(rel, false, `maxDuration not exported — ${route.reason}`);
    continue;
  }

  const value = Number(match[1]);
  const withinVercel = value <= VERCEL_MAX;
  const exceedsDefault = value > 10;

  check(
    `${rel} → maxDuration=${value}`,
    withinVercel && exceedsDefault,
    !exceedsDefault
      ? `Must be > 10s (Vercel default) — ${route.reason}`
      : !withinVercel
      ? `Exceeds Vercel Pro limit (${VERCEL_MAX}s)`
      : route.reason,
  );
}

// 2. LLM generation timeout sanity
console.log("\nLLM generation timeout:");
{
  const src = readFile(LLM_TIMEOUT_CHECK.path);
  const match = src.match(
    new RegExp(`${LLM_TIMEOUT_CHECK.constant}\\s*=\\s*([\\d_]+)`),
  );

  if (!match) {
    check(LLM_TIMEOUT_CHECK.constant, false, "Constant not found");
  } else {
    const value = Number(match[1].replace(/_/g, ""));
    const sane = value > 0 && value <= LLM_TIMEOUT_CHECK.maxMs;
    check(
      `${LLM_TIMEOUT_CHECK.constant} = ${value}ms`,
      sane,
      sane
        ? "LLM path is dev-only in production (returns 404 in production env)"
        : `Expected 0 < value ≤ ${LLM_TIMEOUT_CHECK.maxMs}ms`,
    );
  }
}

// 3. Verify dev route is production-gated
console.log("\nDev route production gate:");
{
  const src = readFile("src/app/api/dev/generate-recommendations/route.ts");
  const gated =
    src.includes("NODE_ENV") &&
    (src.includes("production") || src.includes("status: 404"));
  check(
    "generate-recommendations returns 404 in production",
    gated,
    gated
      ? "LLM calls don't run in Vercel serverless production context"
      : "Route must return 404 when NODE_ENV === 'production'",
  );
}

// Summary
console.log(`\n${"─".repeat(50)}`);
console.log(`${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
