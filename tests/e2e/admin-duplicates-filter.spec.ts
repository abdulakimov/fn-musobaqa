import { expect, test } from "@playwright/test";

test("admin duplicates checkbox shows only duplicate FISH rows", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const apiDuplicates = await page.evaluate(async () => {
    const res = await fetch("/api/admin/registrations?duplicates=1");
    const json = await res.json();
    return {
      status: res.status,
      total: Number(json?.total ?? 0),
      rows: Array.isArray(json?.data) ? json.data.length : 0,
    };
  });

  expect(apiDuplicates.status).toBe(200);
  await page.goto("/admin?duplicates=1");
  const table = page.locator("table");

  if (apiDuplicates.total === 0) {
    await expect(page.getByText(/Hozircha ro'yxatdan o'tgan ishtirokchilar yo'q/i)).toBeVisible();
    return;
  }

  const expectedVisibleRows = Math.min(apiDuplicates.total, 15);
  await expect(page.getByRole("heading", { name: /Ro'yxatdan o'tganlar/i })).toContainText(`(${apiDuplicates.total})`);
  await expect(table.locator("tbody tr")).toHaveCount(expectedVisibleRows);
  await expect(table.getByText(/Duplikat \(\d+\)/).first()).toBeVisible();
});
