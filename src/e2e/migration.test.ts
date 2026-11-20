/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect, Page } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

const heartMigrationFragment =
  "#project:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A=";

const sunlightSensorMigrationFragment =
  "#project:XQAAgAByAQAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOW6kOsIEMK7SL0Qco7jgsHFKZXfjv/XcHWvXG9qyz1a/a3NUulFDj/FDJxVAIV+WZLpRoo4E6MbW70FOgIfBPWP2hDVsojpoLc7ZfKI8SHxv54FSfB5bkbzaAKO+8CO73t6Odtv691JGjJ9MExFighY6GxyM/DoNInDDpAjFeaqCWrYdwENX7ZVM3we8f4swI71tL28N7sg588aB//A78AA";

test.describe("migration", () => {
  test("Loads the project from the URL", async ({ app, homePage }) => {
    await app.goto({ fragment: heartMigrationFragment });
    await app.page.reload();
    await app.expectProjectName("Hearts");
    await app.expectEditorContainText(
      "from microbit import *display.show(Image.HEART)"
    );

    // Regression test: Check that we can switch to a different migration in the same session.
    // Previously we ignored the migration because we already had content in session storage.
    await app.goto({
      fragment: sunlightSensorMigrationFragment,
    });
    await app.page.reload();
    // wait for page to load
    await app.saveButton.waitFor();
    await app.expectEditorContainText("display.read_light_level");

    // Each link made a project rather than replacing the last.
    await app.goHome();
    await homePage.cards.expectVisible("Hearts");
  });
});

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
      await app.goto({ fragment: heartMigrationFragment });
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
