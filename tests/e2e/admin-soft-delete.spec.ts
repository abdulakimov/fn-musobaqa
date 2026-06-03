import { expect, test } from "@playwright/test";

test("admin single delete archives row and blocks archived row updates", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-6);
  const marker = `Soft${stamp}`;

  const seed = await page.evaluate(async (nameMarker) => {
    const payload = {
      ism: nameMarker,
      familiya: "Delete",
      otasiningIsmi: "Check",
      telefon: `+99894${Date.now().toString().slice(-7)}`,
      yonalish: "TYPING" as const,
      yoshGuruhi: "YOSH_9_14" as const,
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { status: res.status, json: await res.json().catch(() => ({})) };
  }, marker);

  test.skip(seed.status !== 201, "Requires reachable database to seed admin rows.");
  expect(seed.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const listRes = await page.request.get(`/api/admin/registrations?q=${encodeURIComponent(marker)}`);
  expect(listRes.status()).toBe(200);
  const listJson = await listRes.json();
  const rowId = (listJson?.data?.[0]?.id as string | undefined) ?? "";
  expect(rowId).not.toEqual("");

  await page.goto(`/admin?q=${encodeURIComponent(marker)}`);
  const row = page.locator("table tbody tr", { hasText: marker }).first();
  await expect(row).toBeVisible();

  await row.getByRole("button", { name: "O'chirish" }).click();
  await expect(page.getByText(/arxivga olinadi/i)).toBeVisible();
  await page.getByRole("button", { name: /arxivlash/i }).click();

  await expect(page.locator("table tbody tr", { hasText: marker })).toHaveCount(0);

  const archivedListRes = await page.request.get(`/api/admin/registrations?q=${encodeURIComponent(marker)}`);
  expect(archivedListRes.status()).toBe(200);
  const archivedListJson = await archivedListRes.json();
  expect(Array.isArray(archivedListJson?.data)).toBeTruthy();
  expect(archivedListJson.data).toHaveLength(0);

  const patchRes = await page.request.patch(`/api/admin/${rowId}/attendance-status`, {
    data: { attendanceStatus: "KELGAN" },
  });
  expect(patchRes.status()).toBe(404);
});
