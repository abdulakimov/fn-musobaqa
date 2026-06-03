import { expect, test } from "@playwright/test";

test("real register closed banner screenshot", async ({ page }) => {
  const stamp = Date.now().toString().slice(-7);

  await page.goto("/register");
  await page.getByPlaceholder("Abdulloh").fill("Real");
  await page.getByPlaceholder("Karimov").fill("Closedov");
  await page.getByPlaceholder("Bahodir o'g'li").fill("Test o'g'li");
  await page.getByPlaceholder("+998 91-234-56-73").fill(`90${stamp}`);
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Matematika" }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "9-11 yosh" }).click();
  await page.getByRole("button", { name: /davom etish/i }).click();
  await page.getByRole("button", { name: /yuborish/i }).click();

  await expect(page.getByText(/ro'yxatdan o'tish yopildi/i)).toBeVisible();
  await expect(page.getByText(/faqat typing yo'nalishi uchun ro'yxatdan o'tish 17-aprel, 18:00/i)).toBeVisible();
  await page.screenshot({ path: ".codex-artifacts/real-register-closed-banner.png", fullPage: true });
});

test("real admin attendance screenshots", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin/);

  const row = page.locator("table tbody tr").first();
  const rowCount = await page.locator("table tbody tr").count();
  test.skip(rowCount === 0, "Admin table has no rows to capture.");
  await expect(row).toBeVisible();

  await page.screenshot({ path: ".codex-artifacts/real-admin-kelish-table.png", fullPage: true });

  const attendanceSelect = row.getByRole("combobox", { name: "Kelish statusi" });
  await attendanceSelect.click();
  await page.getByRole("option", { name: "Kelgan" }).click();
  await expect(attendanceSelect).toContainText("Kelgan");
  await page.screenshot({ path: ".codex-artifacts/real-admin-kelgan.png", fullPage: true });

  await attendanceSelect.click();
  await page.getByRole("option", { name: "Kelmadi" }).click();
  await expect(attendanceSelect).toContainText("Kelmadi");
  await page.screenshot({ path: ".codex-artifacts/real-admin-kelmadi.png", fullPage: true });
});
