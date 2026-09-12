/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("projects page", () => {
  test.use({ autoGoto: false });

  test("shows a message when there are no projects", async ({
    projectsPage,
  }) => {
    await projectsPage.goto();
    await projectsPage.expectNoProjects();
    await projectsPage.expectToolbarHidden();
  });

  test("goes back home", async ({ homePage, projectsPage }) => {
    await projectsPage.goto();
    await projectsPage.goHome();
    await homePage.expectOnPage();
  });

  test.describe("with projects", () => {
    test.beforeEach(async ({ app, homePage, projectsPage }) => {
      await homePage.goto();
      for (const name of ["Alpha", "Beta"]) {
        await homePage.newProject(name);
        await app.expectProjectName(name);
        await app.page.getByRole("button", { name: "Home" }).click();
        await homePage.expectOnPage();
      }
      await projectsPage.goto();
      await projectsPage.expectProjectCount(2);
    });

    test("lists most recent first and sorts by name", async ({
      projectsPage,
    }) => {
      await projectsPage.expectProjectOrder(["Beta", "Alpha"]);
      await projectsPage.sortBy("Name");
      await projectsPage.expectProjectOrder(["Alpha", "Beta"]);
      await projectsPage.toggleSortDirection();
      await projectsPage.expectProjectOrder(["Beta", "Alpha"]);
    });

    test("searches by name", async ({ projectsPage }) => {
      await projectsPage.search("alp");
      await projectsPage.expectProjectOrder(["Alpha"]);
      await projectsPage.search("nothing here");
      await projectsPage.expectNoProjects();
      await projectsPage.clearSearch();
      await projectsPage.expectProjectCount(2);
    });

    test("opens a project from its menu", async ({ app, projectsPage }) => {
      await projectsPage.cards.menuOpen("Alpha");
      await app.expectProjectName("Alpha");
    });

    test("renames, duplicates and deletes from the toolbar", async ({
      projectsPage,
    }) => {
      await projectsPage.select("Alpha");
      await projectsPage.expectToolbarVisible();
      await projectsPage.expectToolbarButtons([
        "Rename",
        "Duplicate",
        "Delete",
        "Clear",
      ]);

      await projectsPage.toolbarRename("Gamma");
      await projectsPage.cards.expectVisible("Gamma");

      await projectsPage.toolbarDuplicate("Gamma copy");
      await projectsPage.expectProjectCount(3);

      await projectsPage.toolbarClear();
      await projectsPage.expectToolbarHidden();

      await projectsPage.select("Gamma");
      await projectsPage.select("Gamma copy");
      await projectsPage.expectToolbarButtons(["Delete 2 projects", "Clear"]);
      await projectsPage.toolbarDelete();
      await projectsPage.expectProjectOrder(["Beta"]);
    });

    test("deletes the open project and the editor moves on", async ({
      app,
      projectsPage,
    }) => {
      // Beta was created last, so it is the tab's open project.
      await projectsPage.cards.menuDelete("Beta");
      await projectsPage.expectProjectOrder(["Alpha"]);

      await app.goto();
      await app.expectProjectName("Alpha");
    });
  });
});
