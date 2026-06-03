#!/usr/bin/env node

import { performance } from "node:perf_hooks";

const BASE_URL = process.env.LOAD_TEST_BASE_URL ?? "http://localhost:3200";
const STEPS = (process.env.LOAD_TEST_STEPS ?? "50,100,150")
  .split(",")
  .map((value) => Number.parseInt(value.trim(), 10))
  .filter((value) => Number.isFinite(value) && value > 0);

const REQUESTS_PER_STEP = Number.parseInt(process.env.LOAD_TEST_REQUESTS_PER_STEP ?? "100", 10);
const TIMEOUT_MS = Number.parseInt(process.env.LOAD_TEST_TIMEOUT_MS ?? "25000", 10);
let requestCounter = 0;
const PHONE_SEED = Number.parseInt(process.env.LOAD_TEST_PHONE_SEED ?? String(Date.now() % 1000000), 10);

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

function chunk(items, size) {
  const out = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

function buildPayload(index) {
  requestCounter += 1;
  const uniqueLocal = ((100000000 + PHONE_SEED * 1000 + requestCounter) % 1000000000)
    .toString()
    .padStart(9, "0");
  return {
    ism: "Load",
    familiya: "Tester",
    otasiningIsmi: "Batch Runner",
    telefon: `+998${uniqueLocal}`,
    yonalish: "TYPING",
    yoshGuruhi: "YOSH_9_14",
  };
}

async function sendRegister(payload) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const started = performance.now();
  try {
    const res = await fetch(`${BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    await res.text();
    return { ok: res.ok, status: res.status, latency: performance.now() - started };
  } catch {
    return { ok: false, status: 0, latency: performance.now() - started };
  } finally {
    clearTimeout(timeoutId);
  }
}

async function runStep(concurrency, totalRequests) {
  const batches = chunk(
    Array.from({ length: totalRequests }, (_, idx) => idx),
    concurrency,
  );
  const results = [];

  for (const batch of batches) {
    const settled = await Promise.all(batch.map((idx) => sendRegister(buildPayload(idx))));
    results.push(...settled);
  }

  const latencies = results.map((item) => item.latency);
  const okCount = results.filter((item) => item.ok).length;
  const statusCount = results.reduce((acc, item) => {
    const key = String(item.status);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  return {
    concurrency,
    totalRequests,
    successRate: Number(((okCount / totalRequests) * 100).toFixed(2)),
    p50: Number(percentile(latencies, 50).toFixed(2)),
    p95: Number(percentile(latencies, 95).toFixed(2)),
    max: Number(Math.max(...latencies).toFixed(2)),
    statusCount,
  };
}

async function waitForServer() {
  const start = performance.now();
  while (performance.now() - start < 30_000) {
    try {
      const res = await fetch(`${BASE_URL}/api/healthz`);
      if (res.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Server is not ready at ${BASE_URL}`);
}

async function main() {
  if (STEPS.length === 0) {
    throw new Error("LOAD_TEST_STEPS contains no valid values");
  }

  await waitForServer();

  const outputs = [];
  for (const concurrency of STEPS) {
    // Small cooldown between steps to avoid carrying over in-flight pressure.
    const result = await runStep(concurrency, REQUESTS_PER_STEP);
    outputs.push(result);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(JSON.stringify({ baseUrl: BASE_URL, requestsPerStep: REQUESTS_PER_STEP, results: outputs }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
