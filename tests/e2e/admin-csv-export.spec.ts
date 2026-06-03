import { test, expect } from "@playwright/test";

test("admin csv export matches active filters dataset", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-5);
  const marker = stamp
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");
  const createPayload = (suffix: string, yonalish: "MATEMATIKA" | "TYPING") => ({
    ism: `Audit${marker}`,
    familiya: "CsvExport",
    otasiningIsmi: "Checker",
    telefon: `+99891${stamp}${suffix}`,
    yonalish,
    yoshGuruhi: yonalish === "TYPING" ? "YOSH_9_14" : "YOSH_9_11",
  });

  const seedResult = await page.evaluate(async ({ payloadA, payloadB }) => {
    const send = async (payload: unknown) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status, json: await res.json() };
    };
    return {
      typing: await send(payloadA),
      math: await send(payloadB),
    };
  }, { payloadA: createPayload("11", "TYPING"), payloadB: createPayload("22", "MATEMATIKA") });

  expect(seedResult.typing.status).toBe(201);
  expect(seedResult.math.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const cookies = await page.context().cookies();
  expect(cookies.some((item) => item.name === "admin_session")).toBeTruthy();

  const audit = await page.evaluate(async (query) => {
    const params = new URLSearchParams({
      yonalish: "TYPING",
      q: query,
    });

    const [jsonRes, csvRes] = await Promise.all([
      fetch(`/api/admin/registrations?${params.toString()}`, { credentials: "include" }),
      fetch(`/api/admin/registrations?format=csv&${params.toString()}`, { credentials: "include" }),
    ]);

    const json = await jsonRes.json();
    const csv = await csvRes.text();
    const lines = csv.trim().split(/\r?\n/);

    return {
      jsonStatus: jsonRes.status,
      csvStatus: csvRes.status,
      total: Number(json.total ?? 0),
      linesCount: lines.length,
      csv,
    };
  }, `Audit${marker}`);

  expect(audit.jsonStatus).toBe(200);
  expect(audit.csvStatus).toBe(200);
  expect(audit.total).toBeGreaterThan(0);
  expect(audit.linesCount).toBe(audit.total + 1);
  expect(audit.csv).toContain(`Audit${marker}`);
});

test("admin csv export respects kelishStatus filter", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-5);
  const markerSuffix = stamp
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");
  const marker = `Kelish${markerSuffix}`;
  const payload = {
    ism: marker,
    familiya: "CsvParity",
    otasiningIsmi: "Tester",
    telefon: `+99893${stamp}11`,
    yonalish: "TYPING" as const,
    yoshGuruhi: "YOSH_9_14" as const,
  };

  const seedResult = await page.evaluate(async (registrationPayload) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationPayload),
    });
    return { status: res.status };
  }, payload);
  expect(seedResult.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const audit = await page.evaluate(async (query) => {
    const listRes = await fetch(`/api/admin/registrations?q=${encodeURIComponent(query)}`, { credentials: "include" });
    const listJson = await listRes.json();
    const row = (listJson.data ?? [])[0];
    if (!row?.id) {
      return { error: "seed_not_found" };
    }

    const updateRes = await fetch(`/api/admin/${row.id}/attendance-status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ attendanceStatus: "KELGAN" }),
    });
    if (!updateRes.ok) {
      return { error: "attendance_update_failed", status: updateRes.status };
    }

    const params = new URLSearchParams({
      q: query,
      kelishStatus: "KELGAN",
    });
    const [jsonRes, csvRes] = await Promise.all([
      fetch(`/api/admin/registrations?${params.toString()}`, { credentials: "include" }),
      fetch(`/api/admin/registrations?format=csv&${params.toString()}`, { credentials: "include" }),
    ]);
    const json = await jsonRes.json();
    const csv = await csvRes.text();
    const lines = csv.trim().split(/\r?\n/);

    return {
      jsonStatus: jsonRes.status,
      csvStatus: csvRes.status,
      total: Number(json.total ?? 0),
      linesCount: lines.length,
      csv,
    };
  }, marker);

  expect(audit.error).toBeUndefined();
  expect(audit.jsonStatus).toBe(200);
  expect(audit.csvStatus).toBe(200);
  expect(audit.total).toBeGreaterThan(0);
  expect(audit.linesCount).toBe(audit.total + 1);
  expect(audit.csv).toContain(marker);
});

test("admin csv export matches combined active filters", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-5);
  const markerSuffix = stamp
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");
  const marker = `Combo${markerSuffix}`;
  const sharedName = {
    ism: marker,
    familiya: "Drift",
    otasiningIsmi: "Parity",
    yonalish: "TYPING" as const,
    yoshGuruhi: "YOSH_9_14" as const,
  };
  const payloadA = { ...sharedName, telefon: `+99894${stamp}11` };
  const payloadB = { ...sharedName, telefon: `+99894${stamp}22` };

  const seeded = await page.evaluate(async ({ first, second }) => {
    const send = async (payload: unknown) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status };
    };
    return {
      first: await send(first),
      second: await send(second),
    };
  }, { first: payloadA, second: payloadB });

  expect(seeded.first.status).toBe(201);
  expect(seeded.second.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const audit = await page.evaluate(async (query) => {
    const seededRes = await fetch(`/api/admin/registrations?q=${encodeURIComponent(query)}&yonalish=TYPING&yoshGuruhi=YOSH_9_14`, {
      credentials: "include",
    });
    const seededJson = await seededRes.json();
    const rows: Array<{ id: string; smsStatus: string; utmType: string; createdAt: string }> = (seededJson.data ?? []);
    if (rows.length < 2) {
      return { error: "seed_rows_not_found", count: rows.length };
    }

    const ids = rows.map((row) => row.id);
    const patchRes = await fetch("/api/admin/registrations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids, contactStatus: "BOGLANILGAN" }),
    });
    if (!patchRes.ok) {
      return { error: "contact_patch_failed", status: patchRes.status };
    }

    for (const id of ids) {
      const attendanceRes = await fetch(`/api/admin/${id}/attendance-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ attendanceStatus: "KELGAN" }),
      });
      if (!attendanceRes.ok) {
        return { error: "attendance_patch_failed", status: attendanceRes.status };
      }
    }

    const createdDate = new Date(rows[0].createdAt);
    const yyyy = createdDate.getUTCFullYear();
    const mm = String(createdDate.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(createdDate.getUTCDate()).padStart(2, "0");
    const isoDate = `${yyyy}-${mm}-${dd}`;

    const params = new URLSearchParams({
      q: query,
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
      contactStatus: "BOGLANILGAN",
      kelishStatus: "KELGAN",
      utmType: rows[0].utmType,
      smsStatus: rows[0].smsStatus,
      dateFrom: isoDate,
      dateTo: isoDate,
      duplicates: "1",
    });

    const [jsonRes, csvRes] = await Promise.all([
      fetch(`/api/admin/registrations?${params.toString()}`, { credentials: "include" }),
      fetch(`/api/admin/registrations?format=csv&${params.toString()}`, { credentials: "include" }),
    ]);

    const json = await jsonRes.json();
    const csv = await csvRes.text();
    const lines = csv.trim().split(/\r?\n/);

    return {
      jsonStatus: jsonRes.status,
      csvStatus: csvRes.status,
      total: Number(json.total ?? 0),
      linesCount: lines.length,
      csv,
    };
  }, marker);

  expect(audit.error).toBeUndefined();
  expect(audit.jsonStatus).toBe(200);
  expect(audit.csvStatus).toBe(200);
  expect(audit.total).toBeGreaterThan(0);
  expect(audit.linesCount).toBe(audit.total + 1);
  expect(audit.csv).toContain(marker);
});
