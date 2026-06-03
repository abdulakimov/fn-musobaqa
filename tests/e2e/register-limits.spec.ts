import { test, expect } from "@playwright/test";

function resolveLimit(raw: string | undefined, fallback: number) {
  const parsed = Number.parseInt(raw ?? "", 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return parsed;
}

const typingLimit = resolveLimit(process.env.LIMIT_TYPING, 512);
const math9_11Limit = resolveLimit(process.env.LIMIT_MATH_9_11, 450);
const runLimitTests = process.env.E2E_LIMIT_TESTS === "1";

test("typing registrations close automatically at limit", async ({ page }) => {
  test.skip(!runLimitTests, "Enable with E2E_LIMIT_TESTS=1 in dedicated limit-test profile.");
  test.skip(typingLimit > 5, "This test expects small LIMIT_TYPING for fast execution (e.g. 2).");

  await page.goto("/register");
  const result = await page.evaluate(async ({ limit }) => {
    const mkPhone = (idx: number) => {
      const local = String(100000000 + ((Date.now() + idx) % 899999999)).slice(-9);
      return `+998${local}`;
    };

    const createPayload = (idx: number) => ({
      ism: "Limit",
      familiya: "Typing",
      otasiningIsmi: "Test",
      telefon: mkPhone(idx),
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
    });

    const statuses: number[] = [];
    const codes: string[] = [];
    for (let i = 0; i < limit + 1; i += 1) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload(i)),
      });
      statuses.push(res.status);
      const json = await res.json().catch(() => ({}));
      codes.push(String(json?.code ?? ""));
    }

    return { statuses, codes };
  }, { limit: typingLimit });

  for (let i = 0; i < typingLimit; i += 1) {
    expect(result.statuses[i]).toBe(201);
  }
  expect(result.statuses[typingLimit]).toBe(403);
  expect(result.codes[typingLimit]).toBe("LIMIT_REACHED_TYPING");
});

test("math 9-11 and 12-14 limits are enforced independently", async ({ page }) => {
  test.skip(!runLimitTests, "Enable with E2E_LIMIT_TESTS=1 in dedicated limit-test profile.");
  test.skip(math9_11Limit > 5, "This test expects small LIMIT_MATH_9_11 for fast execution (e.g. 2).");

  await page.goto("/register");
  const result = await page.evaluate(async ({ limit }) => {
    const mkPhone = (idx: number) => {
      const local = String(100000000 + ((Date.now() + idx * 17) % 899999999)).slice(-9);
      return `+998${local}`;
    };

    const payload9_11 = (idx: number) => ({
      ism: "Limit",
      familiya: "Math",
      otasiningIsmi: "Kids",
      telefon: mkPhone(idx),
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_9_11",
    });

    const payload12_14 = (idx: number) => ({
      ism: "Limit",
      familiya: "Math",
      otasiningIsmi: "Teens",
      telefon: mkPhone(idx + 5000),
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_12_14",
    });

    const statuses: number[] = [];
    const codes: string[] = [];

    for (let i = 0; i < limit + 1; i += 1) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload9_11(i)),
      });
      statuses.push(res.status);
      const json = await res.json().catch(() => ({}));
      codes.push(String(json?.code ?? ""));
    }

    const teensRes = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload12_14(1)),
    });

    return {
      statuses,
      codes,
      teensStatus: teensRes.status,
      teensJson: await teensRes.json().catch(() => ({})),
    };
  }, { limit: math9_11Limit });

  for (let i = 0; i < math9_11Limit; i += 1) {
    expect(result.statuses[i]).toBe(201);
  }
  expect(result.statuses[math9_11Limit]).toBe(403);
  expect(result.codes[math9_11Limit]).toBe("LIMIT_REACHED_MATH_9_11");
  expect(result.teensStatus).toBe(201);
});
