import { test as base } from "@playwright/test";
import { App, baseUrl } from "./app.js";
import { HomePage } from "./home-page.js";
import { ProjectsPage } from "./projects-page.js";

type MyFixtures = {
  app: App;
  homePage: HomePage;
  projectsPage: ProjectsPage;
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
  // On the context rather than the app fixture: the compliance notice is a
  // modal dialog that hides the page from the accessibility tree, so a test
  // that only drives the pages needs the cookie just as much as one that
  // drives the editor.
  context: async ({ context, noIndexedDB }, use) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await context.addCookies([
      {
        // See corresponding code in App.tsx.
        name: "mockDevice",
        value: "1",
        url: baseUrl,
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
        url: baseUrl,
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
    await use(context);
  },
  app: async ({ page, context, autoGoto }, use) => {
    const app = new App(page, context);
    if (autoGoto) {
      await app.goto();
    }
    await use(app);
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  projectsPage: async ({ page }, use) => {
    await use(new ProjectsPage(page));
  },
});
