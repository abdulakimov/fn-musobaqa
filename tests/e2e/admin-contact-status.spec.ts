import { expect, test } from "@playwright/test";

test("admin contact status column, updates, filters and csv export work", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-5);
  const marker = stamp
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");

  const createPayload = (nameSuffix: string, phoneSuffix: string) => ({
    ism: `Contact${marker}${nameSuffix}`,
    familiya: "Status",
    otasiningIsmi: "Checker",
    telefon: `+99890${stamp}${phoneSuffix}`,
    yonalish: "TYPING" as const,
    yoshGuruhi: "YOSH_9_14" as const,
  });

  const seed = await page.evaluate(async ({ payloadA, payloadB }) => {
    const send = async (payload: unknown) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status, json: await res.json() };
    };

    return {
      first: await send(payloadA),
      second: await send(payloadB),
    };
  }, { payloadA: createPayload("A", "11"), payloadB: createPayload("B", "22") });

  expect(seed.first.status).toBe(201);
  expect(seed.second.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto(`/admin?q=Contact${marker}`);
  const table = page.locator("table");
  await expect(table.getByRole("columnheader", { name: "Aloqa" })).toBeVisible();

  const rows = table.locator("tbody tr", { hasText: `Contact${marker}` });
  await expect(rows).toHaveCount(2);

  const firstRow = rows.first();
  await firstRow.getByRole("combobox", { name: "Aloqa statusi" }).click();
  await page.getByRole("option", { name: "Bog'lanib bo'lmadi" }).click();
  await expect(firstRow.getByRole("combobox", { name: "Aloqa statusi" })).toContainText("Bog'lanib bo'lmadi");

  await rows.nth(0).getByRole("checkbox").first().click();
  await rows.nth(1).getByRole("checkbox").first().click();
  await page.getByRole("combobox", { name: "Bulk aloqa statusi" }).click();
  await page.getByRole("option", { name: "Bog'lanilgan" }).click();
  await page.getByRole("button", { name: "Qo'llash" }).click();

  await expect(rows.nth(0).getByRole("combobox", { name: "Aloqa statusi" })).toContainText("Bog'lanilgan");
  await expect(rows.nth(1).getByRole("combobox", { name: "Aloqa statusi" })).toContainText("Bog'lanilgan");

  await page.getByRole("combobox", { name: "Aloqa filtri" }).click();
  await page.getByRole("option", { name: "Bog'lanilgan" }).click();
  await expect(page).toHaveURL(/contactStatus=BOGLANILGAN/);

  const audit = await page.evaluate(async (query) => {
    const params = new URLSearchParams({
      q: query,
      contactStatus: "BOGLANILGAN",
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
      header: lines[0] ?? "",
    };
  }, `Contact${marker}`);

  expect(audit.jsonStatus).toBe(200);
  expect(audit.csvStatus).toBe(200);
  expect(audit.total).toBeGreaterThan(0);
  expect(audit.linesCount).toBe(audit.total + 1);
  expect(audit.header).toContain("Aloqa statusi");
});
