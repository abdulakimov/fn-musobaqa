import { test, expect } from "@playwright/test";

test("register api mocked happy path", async ({ page }) => {
  await page.route("**/api/register", async (route) => {
    await route.fulfill({
      status: 201,
      contentType: "application/json",
      body: JSON.stringify({ success: true, id: "mock-id-1", participantId: "A1111" }),
    });
  });

  await page.goto("/register");
  const result = await page.evaluate(async () => {
    const payload = {
      ism: "Test",
      familiya: "User",
      otasiningIsmi: "Parent",
      telefon: "+998901234567",
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_9_11",
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: res.status, json: await res.json() };
  });

  expect(result.status).toBe(201);
  expect(result.json.success).toBeTruthy();
  expect(result.json.participantId).toBe("A1111");
});

test("register api rejects legacy payload keys", async ({ page }) => {
  await page.goto("/register");
  const result = await page.evaluate(async () => {
    const payload = {
      ism: "Test",
      familiya: "User",
      otasiningIsmi: "Parent",
      telefon: "+998901234567",
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_9_11",
      malumotnomaDUrl: "https://utfs.io/f/legacy-doc.pdf",
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: res.status };
  });

  expect(result.status).toBe(422);
});

test("register api rejects overlong phone instead of truncating", async ({ page }) => {
  await page.goto("/register");
  const result = await page.evaluate(async () => {
    const payload = {
      ism: "Test",
      familiya: "User",
      otasiningIsmi: "Parent",
      telefon: "+9989912345678",
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_9_11",
    };
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { status: res.status, json: await res.json() };
  });

  expect(result.status).toBe(422);
  expect(result.json?.errors?.fieldErrors?.telefon?.length ?? 0).toBeGreaterThan(0);
});
