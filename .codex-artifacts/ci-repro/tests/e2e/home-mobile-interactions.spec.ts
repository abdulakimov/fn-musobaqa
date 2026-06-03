import { expect, test } from "@playwright/test";

test.describe("home mobile interactions", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
  });

  test("mobile menu opens, links are clickable, and closes", async ({ page }) => {
    await page.getByRole("button", { name: /menu/i }).click();
    const drawer = page.locator("#mobile-nav");
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "FAQ", exact: true }).click();
    await expect(page.locator("#faq")).toBeInViewport();
    await expect(drawer).toBeHidden();
  });

  test("mobile drawer logo navigates home", async ({ page }) => {
    await page.goto("/#faq");
    await page.getByRole("button", { name: /menu/i }).click();
    const drawer = page.locator("#mobile-nav");
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: /robbit akademiyasi|robbit/i }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(drawer).toBeHidden();
  });

  test("faq accordion opens on mobile tap", async ({ page }) => {
    await page.locator("#faq").scrollIntoViewIfNeeded();

    const trigger = page.getByRole("button", { name: "Musobaqa pullikmi?", exact: true });
    await trigger.click();
    await expect(page.getByText("mutlaqo bepul")).toBeVisible();
  });

  test("hero cta and scroll indicator are clickable", async ({ page }) => {
    const detailLink = page.getByRole("link", { name: "Batafsil ma'lumot", exact: true });
    await detailLink.click();
    await expect(page.locator("#about")).toBeInViewport();

    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByLabel(/pastga bo'limiga o'tish/i).click();
    await expect(page.locator("#about")).toBeInViewport();
  });
});
