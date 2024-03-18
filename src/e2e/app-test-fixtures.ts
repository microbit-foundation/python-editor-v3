import { test as base } from "@playwright/test";
import { App } from "./app.js";

type MyFixtures = {
  app: App;
};

export const test = base.extend<MyFixtures>({
  app: async ({ page, context }, use) => {
    const app = new App(page, context);
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await context.addCookies([
      {
        // See corresponding code in App.tsx.
        name: "mockDevice",
        value: "1",
        url: app.baseUrl,
      },
      // Don't show compliance notice for Foundation builds
      {
        name: "MBCC",
        value: encodeURIComponent(
          JSON.stringify({
            version: 1,
            analytics: false,
            functional: true,
          })
        ),
        url: app.baseUrl,
      },
    ]);
    await app.goto();
    await use(app);
  },
});
