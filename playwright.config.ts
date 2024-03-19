import { defineConfig, devices } from "@playwright/test";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    ...(process.env.CI
      ? {
          command: `npx vite preview --port 3000 --base ${process.env.BASE_URL}`,
          url: `http://localhost:3000${process.env.BASE_URL}`,
        }
      : {
          command: "npm run start",
          url: "http://localhost:3000",
        }),
    reuseExistingServer: !process.env.CI,
  },
});
