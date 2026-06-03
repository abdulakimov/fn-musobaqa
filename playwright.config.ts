import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: "http://localhost:3200",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3200",
    url: "http://localhost:3200",
    reuseExistingServer: process.env.CI ? false : true,
    timeout: 240_000,
    env: {
      ...process.env,
      REGISTRATION_DEADLINE_TASHKENT: "2026-12-31T23:59:59+05:00",
      TYPING_REGISTRATION_DEADLINE_TASHKENT: "2026-12-31T23:59:59+05:00",
      LIMIT_TYPING: "5000",
      LIMIT_MATH_9_11: "5000",
      LIMIT_MATH_12_14: "5000",
    },
  },
});
