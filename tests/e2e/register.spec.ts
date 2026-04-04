import { test, expect } from "@playwright/test";

test("register validates required fields", async ({ page }) => {
  await page.goto("/register");
  await page.getByRole("button", { name: /davom etish/i }).click();

  await expect(page.getByText(/ism kamida 2 harf/i).first()).toBeVisible();
  await expect(page.getByText(/telefon \+998/i).first()).toBeVisible();
});

test("register moves to step 2 with valid step 1 input", async ({ page }) => {
  await page.goto("/register");

  await page.getByPlaceholder("Abdulloh").fill("Ali");
  await page.getByPlaceholder("Karimov").fill("Karimov");
  await page.getByPlaceholder("Bahodir o'g'li").fill("Vali o'g'li");
  await page.getByPlaceholder("+998 91-234-56-73").fill("901112233");
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Matematika" }).click();
  await page.getByRole("combobox").nth(1).click();
  await page.getByRole("option", { name: "9-11 yosh" }).click();
  await page.getByRole("button", { name: /davom etish/i }).click();

  await expect(page.getByText(/ma'lumotlarni tasdiqlang/i)).toBeVisible();
});

test("typing direction forces 9-14 age group", async ({ page }) => {
  await page.goto("/register");

  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Typing" }).click();

  await expect(page.getByRole("combobox").nth(1)).toContainText("9-14 yosh");
});
