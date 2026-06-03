import { test, expect, type Page } from "@playwright/test";

const UTM_SCHOOL = "/?utm_source=maktab&utm_medium=flayer&utm_campaign=musobaqa";
const UTM_BANNER = "/?utm_source=kocha-banner&utm_medium=flayer&utm_campaign=musobaqa";

function toLetterToken(seed: string) {
  return seed
    .split("")
    .map((char) => String.fromCharCode(65 + Number.parseInt(char, 10)))
    .join("");
}

function buildPayload(phone: string, tag: string) {
  return {
    ism: `UTM${tag}`,
    familiya: `Source${tag}`,
    otasiningIsmi: "Checker",
    telefon: phone,
    yonalish: "TYPING",
    yoshGuruhi: "YOSH_9_14",
  };
}

async function registerViaPage(page: Page, payload: ReturnType<typeof buildPayload>) {
  return page.evaluate(async (data) => {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return { status: res.status, json: await res.json() };
  }, payload);
}

test("utm registrations are filterable as maktab/banner/organik in admin", async ({ page, request }) => {
  const stamp = Date.now().toString().slice(-6);
  const token = toLetterToken(stamp);
  const schoolTag = `${token}S`;
  const bannerTag = `${token}B`;
  const organicTag = `${token}O`;
  const phoneSeed = stamp.slice(-6);

  await page.goto(UTM_SCHOOL);
  const schoolResult = await registerViaPage(page, buildPayload(`+99890${phoneSeed}1`, schoolTag));
  expect(schoolResult.status).toBe(201);

  await page.goto(UTM_BANNER);
  const bannerResult = await registerViaPage(page, buildPayload(`+99890${phoneSeed}2`, bannerTag));
  expect(bannerResult.status).toBe(201);

  const organicResult = await request.post("/api/register", {
    data: buildPayload(`+99890${phoneSeed}3`, organicTag),
  });
  expect(organicResult.status()).toBe(201);

  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const audit = await page.evaluate(async ({ schoolTag, bannerTag, organicTag }) => {
    const fetchFiltered = async (utmType: string, q: string) => {
      const params = new URLSearchParams({ utmType, q });
      const res = await fetch(`/api/admin/registrations?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      return { status: res.status, total: Number(json.total ?? 0) };
    };

    return {
      school: await fetchFiltered("MAKTAB", schoolTag),
      banner: await fetchFiltered("BANNER", bannerTag),
      organic: await fetchFiltered("ORGANIK", organicTag),
    };
  }, { schoolTag, bannerTag, organicTag });

  expect(audit.school.status).toBe(200);
  expect(audit.banner.status).toBe(200);
  expect(audit.organic.status).toBe(200);
  expect(audit.school.total).toBeGreaterThan(0);
  expect(audit.banner.total).toBeGreaterThan(0);
  expect(audit.organic.total).toBeGreaterThan(0);
});

test("admin sort dropdowns show stable labels for fallback defaults", async ({ page }) => {
  await page.goto("/admin/login");
  await page.locator('input[name="username"]').fill(process.env.ADMIN_USERNAME ?? "musobaqa");
  await page.locator('input[name="password"]').fill(process.env.ADMIN_PASSWORD ?? "robbitadmin");
  await page.getByRole("button", { name: "Kirish" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin?sortBy=bad&sortDir=bad");
  const sortByTrigger = page.getByRole("combobox", { name: "Saralash maydoni" });
  const sortDirTrigger = page.getByRole("combobox", { name: "Saralash yo'nalishi" });

  await expect(sortByTrigger).toContainText("Sana");
  await expect(sortDirTrigger).toContainText("Kamayish bo'yicha");
  await expect(sortDirTrigger).not.toContainText("desc");
});
