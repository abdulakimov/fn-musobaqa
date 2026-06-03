import { test, expect } from "@playwright/test";

function typingOrdinal(id: string) {
  const letter = id.charAt(0);
  const digits = id.slice(1);
  const letterIndexMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  const letterIndex = letterIndexMap[letter];
  if (letterIndex === undefined) return -1;
  const d0 = Number.parseInt(digits.charAt(0), 10) - 1;
  const d1 = Number.parseInt(digits.charAt(1), 10) - 1;
  const d2 = Number.parseInt(digits.charAt(2), 10) - 1;
  const d3 = Number.parseInt(digits.charAt(3), 10) - 1;
  if ([d0, d1, d2, d3].some((item) => item < 0 || item > 8)) return -1;
  const numberIndex = (((d0 * 9) + d1) * 9 + d2) * 9 + d3;
  return numberIndex * 4 + letterIndex;
}

test("register response contains direction-based participantId and math queue advances", async ({ page }) => {
  await page.goto("/register");

  const result = await page.evaluate(async () => {
    const unique = Date.now().toString().slice(-5);
    const payloadMath1 = {
      ism: "Ali",
      familiya: "Karimov",
      otasiningIsmi: "Vali o'g'li",
      telefon: `+99890${unique}11`,
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_9_11",
    };

    const payloadMath2 = {
      ism: "Ali",
      familiya: "Karimov",
      otasiningIsmi: "Vali o'g'li",
      telefon: `+99890${unique}22`,
      yonalish: "MATEMATIKA",
      yoshGuruhi: "YOSH_12_14",
    };

    const payloadTyping = {
      ism: "Ali",
      familiya: "Karimov",
      otasiningIsmi: "Vali o'g'li",
      telefon: `+99890${unique}33`,
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
    };

    const resMath1 = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadMath1),
    });
    const resMath2 = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadMath2),
    });
    const resTyping = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadTyping),
    });

    return {
      math1Status: resMath1.status,
      math2Status: resMath2.status,
      typingStatus: resTyping.status,
      math1: await resMath1.json(),
      math2: await resMath2.json(),
      typing: await resTyping.json(),
    };
  });

  expect(result.math1Status).toBe(201);
  expect(result.math2Status).toBe(201);
  expect(result.typingStatus).toBe(201);

  const id1 = result.math1.participantId as string;
  const id2 = result.math2.participantId as string;
  const idTyping = result.typing.participantId as string;

  expect(id1).toMatch(/^K[1-9]{4}$/);
  expect(id2).toMatch(/^T[1-9]{4}$/);
  expect(idTyping).toMatch(/^[ABCD][1-9]{4}$/);
});

test("typing ids stay on A/B/C/D and advance in sequence", async ({ page }) => {
  await page.goto("/register");

  const result = await page.evaluate(async () => {
    const unique = Date.now().toString().slice(-5);
    const createPayload = (suffix: string) => ({
      ism: "Ali",
      familiya: "Karimov",
      otasiningIsmi: "Vali o'g'li",
      telefon: `+99895${unique}${suffix}`,
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
    });

    const ids: string[] = [];
    for (const suffix of ["11", "22", "33", "44", "55"]) {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload(suffix)),
      });
      const json = await res.json();
      ids.push(String(json.participantId ?? ""));
    }
    return ids;
  });

  for (const id of result) {
    expect(id).toMatch(/^[ABCD][1-9]{4}$/);
  }

  const ordinals = result.map((id) => typingOrdinal(id));
  for (let i = 1; i < ordinals.length; i += 1) {
    expect(ordinals[i]).toBeGreaterThan(ordinals[i - 1] ?? -1);
  }
});

test("participant can login with phone and participantId", async ({ page }) => {
  await page.goto("/register");

  const registerResult = await page.evaluate(async () => {
    const suffix = `${Date.now()}`.slice(-5);
    const payload = {
      ism: "Sardor",
      familiya: "Tursunov",
      otasiningIsmi: "Anvar o'g'li",
      telefon: `+99891${suffix}33`,
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { status: res.status, json: await res.json(), phone: payload.telefon };
  });

  expect(registerResult.status).toBe(201);

  const participantId = registerResult.json.participantId as string;
  const phone = registerResult.phone;

  await page.goto(`/profile/login?phone=${encodeURIComponent(phone)}&id=${encodeURIComponent(participantId)}`);
  await page.getByRole("button", { name: "Kirish" }).click();

  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByText("Ishtirokchi profili")).toBeVisible();
  await expect(page.locator("strong").filter({ hasText: participantId }).first()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Musobaqa bileti" })).toBeVisible();
  await expect(page.getByRole("button", { name: /biletni yuklab olish/i })).toBeVisible();
});

test("profile logout redirects to home page", async ({ page }) => {
  await page.goto("/register");

  const registerResult = await page.evaluate(async () => {
    const suffix = `${Date.now()}`.slice(-5);
    const payload = {
      ism: "Akmal",
      familiya: "Qodirov",
      otasiningIsmi: "Anvar o'g'li",
      telefon: `+99893${suffix}44`,
      yonalish: "TYPING",
      yoshGuruhi: "YOSH_9_14",
    };

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    return { status: res.status, json: await res.json(), phone: payload.telefon };
  });

  expect(registerResult.status).toBe(201);

  const participantId = registerResult.json.participantId as string;
  const phone = registerResult.phone;

  await page.goto(`/profile/login?phone=${encodeURIComponent(phone)}&id=${encodeURIComponent(participantId)}`);
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.getByRole("button", { name: "Chiqish" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("invalid participant session cookie does not cause profile login loop", async ({ page, context }) => {
  await context.addCookies([
    {
      name: "participant_session",
      value: "legacy.invalid",
      url: "http://localhost:3200/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);

  await page.goto("/profile/login");
  await expect(page).toHaveURL(/\/profile\/login$/);
  await expect(page.getByRole("heading", { name: /profilga kirish/i })).toBeVisible();
});

test("profile login api validates phone and participantId formats", async ({ page }) => {
  await page.goto("/profile/login");

  const invalidPhone = await page.evaluate(async () => {
    const res = await fetch("/api/profile/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefon: "+9989912345678", participantId: "A1111" }),
    });
    return { status: res.status, json: await res.json() };
  });

  expect(invalidPhone.status).toBe(422);
  expect(invalidPhone.json?.code).toBe("PHONE_INVALID");

  const invalidId = await page.evaluate(async () => {
    const res = await fetch("/api/profile/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ telefon: "+998901112233", participantId: "ZZZZ" }),
    });
    return { status: res.status, json: await res.json() };
  });

  expect(invalidId.status).toBe(422);
  expect(invalidId.json?.code).toBe("ID_INVALID");
});
