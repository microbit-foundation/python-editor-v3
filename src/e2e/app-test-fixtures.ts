import { test as base } from "@playwright/test";
import { App } from "./app.js";

type MyFixtures = {
  app: App;
};

type Options = {
  /** Hide IndexedDB so the editor falls back to session storage. */
  noIndexedDB: boolean;
  /** Open the editor before the test. Off for tests that embed it. */
  autoGoto: boolean;
};

export const test = base.extend<MyFixtures & Options>({
  noIndexedDB: [false, { option: true }],
  autoGoto: [true, { option: true }],
  app: async ({ page, context, noIndexedDB, autoGoto }, use) => {
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
    if (noIndexedDB) {
      await context.addInitScript(() => {
        // The getter lives on the prototype so an own property is needed.
        Object.defineProperty(window, "indexedDB", {
          value: undefined,
          configurable: true,
        });
      });
    }
    if (autoGoto) {
      await app.goto();
    }
    await use(app);
  },
});
