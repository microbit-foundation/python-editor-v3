/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

test.describe("home page", () => {
  // The app fixture sets up the context; these tests start from home.
  test.use({ autoGoto: false });

  test("shows the banner and the resource rows", async ({ homePage }) => {
    await homePage.goto();
    await expect(
      homePage.page.getByRole("heading", {
        name: "Code your BBC micro:bit with Python",
      })
    ).toBeVisible();
    for (const row of [
      "Project ideas",
      "Teacher resources",
      "Help and support",
    ]) {
      await expect(
        homePage.page.getByRole("heading", { name: row })
      ).toBeVisible();
    }
  });

  test("creates a project and opens it in the editor", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Night light");

    await app.expectProjectName("Night light");
    await expect(app.page).toHaveURL(/\/project(\?|$)/);
    await app.expectEditorContainText("from microbit import");
  });

  test("returns home from the editor with the project listed", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Night light");
    await app.expectProjectName("Night light");

    await app.goHome();

    await homePage.expectOnPage();
    await homePage.cards.expectVisible("Night light");
  });

  test("reopens a project from its card with the edits kept", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Night light");
    await app.expectProjectName("Night light");
    await app.typeInEditor("# a change");
    await app.expectEditorContainText("# a change");
    await app.goHome();
    await homePage.expectOnPage();
    await homePage.newProject("Other");
    await app.expectProjectName("Other");
    await app.goHome();
    await homePage.expectOnPage();

    await homePage.cards.open("Night light");

    await app.expectProjectName("Night light");
    await app.expectEditorContainText("# a change");
  });

  test("renames, duplicates and deletes from the card menu", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Night light");
    await app.expectProjectName("Night light");
    await app.goHome();
    await homePage.expectOnPage();

    await homePage.cards.menuRename("Night light", "Day light");
    await homePage.cards.expectVisible("Day light");
    await homePage.cards.expectNotVisible("Night light");

    await homePage.cards.menuDuplicate("Day light", "Copy of Day light");
    await homePage.cards.expectVisible("Copy of Day light");
    await homePage.cards.expectVisible("Day light");

    await homePage.cards.menuDelete("Day light");
    await homePage.cards.expectNotVisible("Day light");
    await homePage.cards.expectVisible("Copy of Day light");
  });

  test("keeps projects across a reload", async ({ app, homePage }) => {
    await homePage.goto();
    await homePage.newProject("Night light");
    await app.expectProjectName("Night light");
    await app.goHome();
    await homePage.expectOnPage();

    await homePage.page.reload();

    await homePage.expectOnPage();
    await homePage.cards.expectVisible("Night light");
  });

  test("links to the projects page", async ({ homePage, projectsPage }) => {
    await homePage.goto();
    await homePage.viewAllProjects();
    await projectsPage.expectOnPage();
  });
});
