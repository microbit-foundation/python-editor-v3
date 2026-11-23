/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, Page } from "@playwright/test";
import { test } from "./app-test-fixtures.js";
import { heartProjectLinkFragment } from "./project-links.js";

/**
 * The editor used to be at the app's root and kept its one project in
 * session storage. A tab left open across the upgrade reloads at the same
 * address, which is now the home page.
 */
test.describe(
  "session storage project from before the projects database",
  () => {
    test.use({ autoGoto: false });

    test.beforeEach(async ({ context }) => {
      await context.addInitScript(() => {
        // Once per tab, as the old editor would have left it: an init script
        // runs on every load, and the migration removes these.
        if (!sessionStorage.getItem("seeded")) {
          sessionStorage.setItem("seeded", "true");
          sessionStorage.setItem("fs/files/main.py", btoa("# from before"));
          sessionStorage.setItem("fs/meta/projectName", "Before the upgrade");
          sessionStorage.setItem("fs/meta/dirty", "true");
        }
      });
    });

    const sessionProjectKeys = (page: Page) =>
      page.evaluate(() =>
        Object.keys(sessionStorage).filter((key) => key.startsWith("fs/"))
      );

    test("is listed when the tab reloads at the root, and opens", async ({
      app,
      homePage,
    }) => {
      await homePage.goto();
      await homePage.cards.expectVisible("Before the upgrade");
      expect(await sessionProjectKeys(app.page)).toEqual([]);

      // Not lost by making something else first.
      await homePage.newProject("Another");
      await app.expectProjectName("Another");
      await app.goHome();
      await homePage.cards.open("Before the upgrade");
      await app.expectProjectName("Before the upgrade");
      await app.expectEditorContainText("# from before");
    });

    test("is listed on the projects page too", async ({ projectsPage }) => {
      await projectsPage.goto();
      await projectsPage.cards.expectVisible("Before the upgrade");
    });

    test("is listed beside the project from a #project: link, which opens", async ({
      app,
      homePage,
    }) => {
      await app.goto({ fragment: heartProjectLinkFragment });
      await app.expectProjectName("Hearts");
      expect(await sessionProjectKeys(app.page)).toEqual([]);

      await app.goHome();
      await homePage.cards.expectVisible("Hearts");
      await homePage.cards.expectVisible("Before the upgrade");
    });

    test("still opens straight away at the editor's new address", async ({
      app,
    }) => {
      await app.goto();
      await app.expectProjectName("Before the upgrade");
      await app.expectEditorContainText("# from before");
      expect(await sessionProjectKeys(app.page)).toEqual([]);
    });
  }
);
