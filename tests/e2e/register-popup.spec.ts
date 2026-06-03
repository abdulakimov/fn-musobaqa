import { test, expect } from "@playwright/test";

test("registration success shows visit popup and continues via button", async ({ page }) => {
  const browserErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async () => {},
      },
    });
  });

  await page.route("**/api/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({
        success: true,
        id: "mock-id-popup",
        participantId: "A1111",
        visit: {
          scheduledAt: "2026-04-19T09:00:00+05:00",
          displayText: "19-aprel, 09:00",
        },
        warning: "Belgilangan vaqtda kelmasangiz, qayta qo'shish imkoni bo'lmaydi.",
      }),
    });
  });

  await page.goto("/register");
  await page.getByPlaceholder("Abdulloh").fill("Ali");
  await page.getByPlaceholder("Karimov").fill("Karimov");
  await page.getByPlaceholder("Bahodir o'g'li").fill("Vali o'g'li");
  await page.getByPlaceholder("+998 91-234-56-73").fill("901112233");
  await page.getByRole("combobox").nth(0).click();
  await page.getByRole("option", { name: "Typing" }).click();
  await page.getByRole("button", { name: /davom etish/i }).click();
  await page.getByRole("button", { name: /yuborish/i }).click();

  await expect(page.getByText(/tashrif vaqti tasdiqlandi/i)).toBeVisible();
  await expect(page.getByText(/musobaqa bileti/i).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /biletni yuklab olish/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /id ni nusxalash/i })).toBeVisible();
  await page.getByRole("button", { name: /id ni nusxalash/i }).click();
  await expect(page.getByText(/id nusxalandi/i)).toBeVisible();
  await page.screenshot({ path: "test-results/popup-open.png", fullPage: true });

  await page.keyboard.press("Escape");
  await expect(page.getByText(/tashrif vaqti tasdiqlandi/i)).toBeVisible();

  await expect(page.getByRole("button", { name: /davom etish/i })).toBeVisible();
  await page.getByRole("button", { name: /davom etish/i }).click();

  await expect(page).toHaveURL(/https:\/\/t\.me\/robbituz/);
  expect(browserErrors.join("\n")).not.toContain("Cannot update a component");
  expect(consoleErrors.join("\n")).not.toContain("Cannot update a component");
});

test("limit response shows banner-only state and returns to step 1", async ({ page }) => {
  await page.route("**/api/register", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        code: "LIMIT_REACHED_MATH_9_11",
        error: "Matematika 9-11 yosh toifasi uchun ro'yxatdan o'tish yakunlandi. Barcha o'rinlar to'ldi.",
        suggestions: [
          {
            yonalish: "MATEMATIKA",
            yoshGuruhi: "YOSH_12_14",
            label: "Matematika (12-14 yosh)",
            remainingSlots: 17,
          },
          {
            yonalish: "TYPING",
            yoshGuruhi: "YOSH_9_14",
            label: "Typing (9-14 yosh)",
            remainingSlots: 8,
          },
        ],
      }),
    });
  });

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
  await page.getByRole("button", { name: /yuborish/i }).click();

  await expect(page.getByText(/joylar to'ldi/i)).toBeVisible();
  await expect(page.getByText(/ma'lumotlarni tasdiqlang/i)).not.toBeVisible();
  await expect(page.getByRole("button", { name: /qaytadan ro'yxatdan o'tish/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /yuborish/i })).not.toBeVisible();
  await expect(page.getByRole("button", { name: /orqaga/i })).not.toBeVisible();
  await page.screenshot({ path: ".codex-artifacts/register-limit-banner.png", fullPage: true });

  await page.getByRole("button", { name: /qaytadan ro'yxatdan o'tish/i }).click();

  await expect(page.getByRole("button", { name: /davom etish/i })).toBeVisible();
  await expect(page.getByRole("combobox").nth(0)).toContainText("Matematika");
  await expect(page.getByRole("combobox").nth(1)).toContainText("9-11 yosh");
});

test("registration closed shows banner (not toast) with typing extension notice", async ({ page }) => {
  await page.route("**/api/register", async (route) => {
    await route.fulfill({
      status: 403,
      contentType: "application/json",
      body: JSON.stringify({
        code: "REGISTRATION_CLOSED",
        error: "Ro'yxatdan o'tish 2026-yil 16-aprel, 23:59 (Asia/Tashkent) da yopilgan",
      }),
    });
  });

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
  await page.getByRole("button", { name: /yuborish/i }).click();

  await expect(page.getByText(/ro'yxatdan o'tish yopildi/i)).toBeVisible();
  await expect(page.getByText(/faqat typing yo'nalishi uchun ro'yxatdan o'tish 17-aprel, 18:00/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /yuborish/i })).not.toBeVisible();
  await expect(page.locator("[data-sonner-toast]")).toHaveCount(0);
  await page.screenshot({ path: ".codex-artifacts/register-closed-banner.png", fullPage: true });
});
