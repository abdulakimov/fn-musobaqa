import { test, expect } from "@playwright/test";

test("admin page redirects to login without session", async ({ page }) => {
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(page.getByRole("heading", { name: /admin panelga kirish/i })).toBeVisible();
});

test("admin api returns 401 without cookie", async ({ request }) => {
  const res = await request.get("/api/admin/registrations");
  expect(res.status()).toBe(401);
});

test("admin delete api returns 401 without cookie", async ({ request }) => {
  const res = await request.delete("/api/admin/registrations", {
    data: { ids: ["some-id"] },
  });
  expect(res.status()).toBe(401);
});
