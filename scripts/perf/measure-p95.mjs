#!/usr/bin/env node
/**
 * p95 response-time measurement script.
 *
 * Usage:
 *   node scripts/perf/measure-p95.mjs <url> <threshold_ms> [samples]
 *
 * Examples (warm state, server must be running):
 *   # PERF-001: recommendation card API ≤ 800ms
 *   node scripts/perf/measure-p95.mjs http://localhost:3000/api/admin/health 800
 *
 *   # PERF-002: recommendation detail render ≤ 700ms
 *   node scripts/perf/measure-p95.mjs http://localhost:3000/ 700
 *
 * Exit codes:
 *   0 — p95 within threshold
 *   1 — p95 exceeded threshold or request error
 */

const [,, url, thresholdArg, samplesArg] = process.argv;

if (!url || !thresholdArg) {
  console.error("Usage: node measure-p95.mjs <url> <threshold_ms> [samples=20]");
  process.exit(1);
}

const THRESHOLD_MS = Number(thresholdArg);
const SAMPLES = Number(samplesArg ?? 20);
const WARMUP = 3;

if (isNaN(THRESHOLD_MS) || isNaN(SAMPLES)) {
  console.error("threshold_ms and samples must be numbers");
  process.exit(1);
}

async function measure(targetUrl) {
  const start = performance.now();
  const res = await fetch(targetUrl, { signal: AbortSignal.timeout(10_000) });
  const elapsed = performance.now() - start;
  if (!res.ok && res.status !== 401) {
    throw new Error(`HTTP ${res.status}`);
  }
  return elapsed;
}

function percentile(sorted, p) {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

console.log(`\nTarget : ${url}`);
console.log(`Samples: ${SAMPLES} (+ ${WARMUP} warmup)`);
console.log(`SLA    : p95 ≤ ${THRESHOLD_MS}ms\n`);

// Warmup
process.stdout.write("Warmup  ");
for (let i = 0; i < WARMUP; i++) {
  try { await measure(url); } catch { /* ignore */ }
  process.stdout.write(".");
}
process.stdout.write(" done\n");

// Measurement
const durations = [];
let errors = 0;
process.stdout.write("Sampling");

for (let i = 0; i < SAMPLES; i++) {
  try {
    durations.push(await measure(url));
  } catch (e) {
    errors++;
  }
  process.stdout.write(".");
}

process.stdout.write(" done\n\n");

if (durations.length === 0) {
  console.error(`All ${SAMPLES} requests failed (${errors} errors). Check server is running.`);
  process.exit(1);
}

const sorted = [...durations].sort((a, b) => a - b);
const p50 = percentile(sorted, 50);
const p95 = percentile(sorted, 95);
const max = sorted[sorted.length - 1];

const pass = p95 <= THRESHOLD_MS;
const mark = (v, limit) => v <= limit ? "✓" : "✗";

console.log(`Results (${durations.length}/${SAMPLES} successful, ${errors} errors)`);
console.log(`  p50 : ${p50.toFixed(0)}ms`);
console.log(`  p95 : ${p95.toFixed(0)}ms  ${mark(p95, THRESHOLD_MS)} (SLA: ≤ ${THRESHOLD_MS}ms)`);
console.log(`  max : ${max.toFixed(0)}ms`);

if (!pass) {
  console.error(`\nFAIL — p95 ${p95.toFixed(0)}ms exceeds ${THRESHOLD_MS}ms threshold`);
  process.exit(1);
}

console.log(`\nPASS — p95 within ${THRESHOLD_MS}ms threshold`);
