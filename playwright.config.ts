import { defineConfig, devices } from "@playwright/test";

// The page objects build their absolute URLs from E2E_PORT, so it has to
// name whichever server this run starts: the dev server locally, or
// `vite preview` on the production build in CI.
const port = process.env.CI ? 4000 : 3000;
process.env.E2E_PORT ??= String(port);

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
    screenshot: "only-on-failure",
    // Docs/simulator states load external content; in sandboxed
    // environments that traffic must flow via the proxy, which Chromium
    // doesn't pick up from the environment itself. Top-level so it's part
    // of the browser launch, not just the context (Chromium ignores a
    // context-only proxy). No-op when HTTPS_PROXY is unset.
    ...(process.env.HTTPS_PROXY
      ? { proxy: proxyFromEnv(process.env.HTTPS_PROXY) }
      : {}),
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run local dev server before starting the tests. */
  webServer: {
    ...(process.env.CI
      ? {
          command: `npx vite preview --port ${port} --base ${process.env.BASE_URL}`,
          url: `http://localhost:${port}${process.env.BASE_URL}`,
        }
      : {
          command: "npm run dev",
          url: `http://localhost:${port}`,
        }),
    reuseExistingServer: !process.env.CI,
  },
});

function proxyFromEnv(proxyUrl: string) {
  const url = new URL(proxyUrl);
  return {
    server: `${url.protocol}//${url.hostname}:${url.port}`,
    username: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    bypass: "localhost,127.0.0.1",
  };
}
