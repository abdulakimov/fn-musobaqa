import { test, expect } from "@playwright/test";

test("home renders key sections", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: /ro'yxatdan o'tish/i }).first()).toBeVisible();
  await expect(page.locator("#nominations")).toBeVisible();
  await expect(page.locator("#timeline")).toBeVisible();
  await expect(page.locator("#faq")).toBeVisible();
});

test("mobile menu opens and closes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /menu/i });
  await menuButton.click();
  await expect(page.locator("#mobile-nav")).toBeVisible();
  await page.getByRole("button", { name: "Close menu", exact: true }).click();
  await expect(page.locator("#mobile-nav")).toBeHidden();
});
