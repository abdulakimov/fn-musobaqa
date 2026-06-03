import { expect, test } from "@playwright/test";

test("admin attendance status actions update table badge", async ({ page }) => {
  await page.goto("/register");

  const stamp = Date.now().toString().slice(-5);
  const marker = stamp
    .split("")
    .map((digit) => String.fromCharCode(65 + Number(digit)))
    .join("");

  const seed = await page.evaluate(async (queryMarker) => {
    const payload = {
      ism: `Kelish${queryMarker}`,
      familiya: "Status",
      otasiningIsmi: "Checker",
      telefon: `+99893${Date.now().toString().slice(-7)}`,
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

  test.skip(seed.status !== 201, "Requires reachable database to seed admin attendance rows.");
  expect(seed.status).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto(`/admin?q=Kelish${marker}`);
  const table = page.locator("table");
  await expect(table.getByRole("columnheader", { name: "Kelish" })).toBeVisible();

  const row = table.locator("tbody tr", { hasText: `Kelish${marker}` }).first();
  const attendanceSelect = row.getByRole("combobox", { name: "Kelish statusi" });
  await expect(attendanceSelect).toContainText("Kelmadi");

  await attendanceSelect.click();
  await page.getByRole("option", { name: "Kelgan" }).click();
  await expect(attendanceSelect).toContainText("Kelgan");

  await attendanceSelect.click();
  await page.getByRole("option", { name: "Kelmadi" }).click();
  await expect(attendanceSelect).toContainText("Kelmadi");
});
