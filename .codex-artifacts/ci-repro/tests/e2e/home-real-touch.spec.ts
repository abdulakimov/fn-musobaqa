import { devices, expect, test } from "@playwright/test";

test.use({ ...devices["Pixel 7"] });

test("real-touch mobile interactions work", async ({ page }) => {
  await page.goto("/");

  const menuButton = page.getByRole("button", { name: /menu/i });
  await menuButton.tap();
  await expect(page.locator("#mobile-nav")).toBeVisible();

  await page.locator("#mobile-nav").getByRole("link", { name: "FAQ", exact: true }).tap();
  await expect(page.locator("#mobile-nav")).toBeHidden();
  await expect(page.locator("#faq")).toBeInViewport();

  const faqTrigger = page.getByRole("button", { name: "Musobaqa pullikmi?", exact: true });
  await faqTrigger.tap();
  await expect(page.getByText("mutlaqo bepul")).toBeVisible();

  await page.goto("/");
  await page.getByLabel(/pastga bo'limiga o'tish/i).tap();
  await expect(page.locator("#about")).toBeInViewport();
});

test("real-touch drawer logo returns to home", async ({ page }) => {
  await page.goto("/#faq");
  await page.getByRole("button", { name: /menu/i }).tap();
  const drawer = page.locator("#mobile-nav");
  await expect(drawer).toBeVisible();

  await drawer.getByRole("link", { name: /robbit akademiyasi|robbit/i }).tap();
  await expect(page).toHaveURL(/\/$/);
  await expect(drawer).toBeHidden();
});
