import { test, expect } from "@playwright/test";

test("admin can select current page users and soft delete them in bulk", async ({ page }) => {
  const markerDigits = Date.now().toString().slice(-5);
  const marker = markerDigits
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");
  const buildPayload = (suffix: string) => ({
    ism: `Bulk${marker}`,
    familiya: "Delete",
    otasiningIsmi: "Target",
    telefon: `+99895${markerDigits}${suffix}`,
    yonalish: "TYPING",
    yoshGuruhi: "YOSH_9_14",
  });

  await page.goto("/register");
  const seeded = await page.evaluate(async ({ payloadA, payloadB }) => {
    const send = async (payload: unknown) => {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return { status: res.status, json: await res.json() };
    };
    return {
      a: await send(payloadA),
      b: await send(payloadB),
    };
  }, { payloadA: buildPayload("11"), payloadB: buildPayload("22") });

  expect(seeded.a.status).toBe(201);
  expect(seeded.b.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto(`/admin?q=${encodeURIComponent(`Bulk${marker}`)}`);
  const tableScope = page.locator("table");
  await expect(tableScope.getByText(`Bulk${marker}`).first()).toBeVisible();

  await page.getByRole("button", { name: /joriy sahifadagi barchasini belgilash/i }).click();
  await expect(page.getByText(/2 ta tanlangan/i)).toBeVisible();

  await page.getByRole("button", { name: /tanlanganlarni o'chirish/i }).click();
  await expect(page.getByText(/arxivga olinadi/i)).toBeVisible();
  await page.getByRole("button", { name: /arxivlash/i }).click();

  await expect(tableScope.getByText(`Bulk${marker}`)).toHaveCount(0);

  const csvRes = await page.request.get(`/api/admin/registrations?format=csv&q=${encodeURIComponent(`Bulk${marker}`)}`);
  expect(csvRes.status()).toBe(200);
  const csv = await csvRes.text();
  expect(csv).not.toContain(`Bulk${marker}`);
});
