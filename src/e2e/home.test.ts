/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { appUrlPattern, homeUrl } from "./app.js";
import { test } from "./app-test-fixtures.js";
import { modalDialog } from "./home-page.js";

test.describe("home page", () => {
  // The app fixture sets up the context; these tests start from home.
  test.use({ autoGoto: false });

  test("shows the banner and the resource rows", async ({ homePage }) => {
    await homePage.goto();
    await expect(
      homePage.page.getByRole("heading", {
        name: "Python for the BBC micro:bit",
      })
    ).toBeVisible();
    for (const row of [
      "Ideas",
      "Teacher resources",
      "Make it: code it projects",
      "Help",
    ]) {
      await expect(
        homePage.page.getByRole("heading", { name: row, exact: true })
      ).toBeVisible();
    }
    await homePage.expectNoNewAccessibilityViolations();
  });

  test.describe(() => {
    test.use({ welcome: true });

    test("shows what's new once", async ({ homePage }) => {
      // Not homePage.goto(): the dialog repeats the heading it waits for.
      await homePage.page.goto(homeUrl());
      const dialog = modalDialog(homePage.page);
      await expect(
        dialog.getByRole("heading", { name: "What's new in the Python Editor" })
      ).toBeVisible();
      await homePage.expectNoNewAccessibilityViolations();
      await dialog.getByRole("button", { name: "Get started" }).click();
      await expect(dialog).toBeHidden();

      await homePage.page.reload();
      await homePage.expectOnPage();
      await expect(dialog).toBeHidden();
    });
  });

  test("creates a project and opens it in the editor", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Night light");

    await app.expectProjectName("Night light");
    await expect(app.page).toHaveURL(appUrlPattern("project"));
    await app.expectEditorContainText("from microbit import");
  });

  test("opens an idea from its dialog as a project showing the idea", async ({
    app,
    homePage,
  }) => {
    const ideaName = "Emotion badge";
    await homePage.goto();
    await homePage.page.getByRole("button", { name: ideaName }).click();
    const dialog = homePage.page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: ideaName, exact: true })
    ).toBeVisible();
    const create = dialog.getByRole("button", { name: "Create", exact: true });
    // Enabled once the idea's code has loaded.
    await expect(create).toBeEnabled();
    await homePage.expectNoNewAccessibilityViolations();

    await create.click();

    await expect(app.page).toHaveURL(
      appUrlPattern("project/ideas/emotion-badge")
    );
    await app.expectProjectName(ideaName);
    await expect(
      app.page.getByRole("tab", { name: "Ideas", selected: true })
    ).toBeVisible();
    await app.expectDocumentationTopLevelHeading(ideaName);
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

  // The helpers above pass straight through these states.
  test("scans a project card, its menu and dialogs", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.page.getByRole("button", { name: "New project" }).click();
    await expect(modalDialog(homePage.page)).toBeVisible();
    await homePage.expectNoNewAccessibilityViolations();
    await homePage.cards.fillNameDialog("Night light", "Create");
    await app.expectProjectName("Night light");
    await app.goHome();
    await homePage.cards.expectVisible("Night light");
    await homePage.expectNoNewAccessibilityViolations();

    await homePage.cards.openMenu("Night light");
    const rename = homePage.page.getByRole("menuitem", { name: "Rename" });
    await expect(rename).toBeVisible();
    await homePage.expectNoNewAccessibilityViolations();

    await rename.click();
    await expect(modalDialog(homePage.page)).toBeVisible();
    await homePage.expectNoNewAccessibilityViolations();
    await homePage.page.keyboard.press("Escape");
    await expect(modalDialog(homePage.page)).toBeHidden();

    await homePage.cards.openMenu("Night light");
    await homePage.page.getByRole("menuitem", { name: "Delete" }).click();
    await expect(homePage.page.getByRole("alertdialog")).toBeVisible();
    await homePage.expectNoNewAccessibilityViolations();
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

  test("imports a hex as a new project", async ({ app, homePage }) => {
    await homePage.goto();
    await homePage.importFile("testData/1.0.1.hex");

    await app.expectProjectName("1.0.1");
    await app.expectEditorContainText(/PASS1/);
    await app.goHome();
    await homePage.cards.expectVisible("1.0.1");
  });

  test("imports a Python script as a new project named after it", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.importFile("testData/samplefile.py");

    await app.expectProjectName("samplefile");
    await app.expectProjectFiles(["main.py"]);
  });

  test("a dropped hex opens as a new project with no overlay left", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await app.dropFile("testData/1.0.1.hex", "home-drop-target");

    await app.expectProjectName("1.0.1");
    await app.expectNoDropOverlay();
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
