/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { App, homeUrl } from "./app.js";
import { test } from "./app-test-fixtures.js";
import { heartProjectLinkFragment } from "./project-links.js";

/**
 * Without IndexedDB the editor keeps the project in session storage, as it
 * did before the projects database, so closing the tab loses it and the
 * before-unload prompt is back.
 */
test.describe("storage fallback", () => {
  test.use({ noIndexedDB: true });

  test("doesn't prompt on close if no edits made", async ({ app }) => {
    await app.closeWithoutBeforeUnloadPrompt();
  });

  test("prompts on close if file edited", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.closeAndExpectBeforeUnloadPrompt();
  });

  test("prompts on close if project name edited", async ({ app }) => {
    const name = "idiosyncratic ruminant";
    await app.setProjectName(name);
    await app.expectProjectName(name);

    await app.closeAndExpectBeforeUnloadPrompt();
  });

  test("replaces the project with a hex without asking if not edited", async ({
    app,
  }) => {
    await app.loadFiles("testData/1.0.1.hex");
    await app.expectProjectName("1.0.1");
  });

  test("asks before a hex replaces an edited project", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.loadFiles("testData/1.0.1.hex");
    await app.expectDialog("Confirm replace project");
    await app.answerDialog("Cancel");
    await app.expectEditorContainText(/A change/);

    await app.loadFiles("testData/1.0.1.hex");
    await app.answerDialog("Replace");
    await app.expectProjectName("1.0.1");
    await app.expectEditorContainText(/PASS1/);
  });

  test("does not say ideas are moving, as there is no home page", async ({
    app,
  }) => {
    await app.switchTab("Ideas");
    await app.expectDocumentationTopLevelHeading("Ideas");
    await expect(
      app.page.getByRole("button", { name: "Learn more" })
    ).toBeHidden();
  });

  test("opens a #project: link at the root in the editor", async ({ app }) => {
    await app.page.goto(homeUrl({ fragment: heartProjectLinkFragment }));
    await app.expectProjectName("Hearts");
    await app.expectEditorContainText("display.show(Image.HEART)");
    expect(new URL(app.page.url()).hash).toEqual("");
  });

  test("retains text across a reload via session storage", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.page.reload();

    await app.expectEditorContainText(/A change/);
  });
});

/**
 * Makes the next IndexedDB put throw, then restores it, or with `every`
 * makes them all throw. The first put in a project flush is the project
 * record, so this fails the whole flush.
 */
const injectWriteError = async (
  app: App,
  errorName: "QuotaExceededError" | "UnknownError",
  { every = false }: { every?: boolean } = {}
) => {
  await app.page.evaluate(
    ({ errorName, every }) => {
      const original = IDBObjectStore.prototype.put;
      IDBObjectStore.prototype.put = function () {
        if (!every) {
          IDBObjectStore.prototype.put = original;
        }
        throw new DOMException(`Simulated ${errorName}`, errorName);
      };
    },
    { errorName, every }
  );
};

/**
 * A failed write to the projects database keeps the edit in the editor and
 * shows a persistent toast, as ml-trainer does.
 */
test.describe("storage write errors", () => {
  test("shows the storage full toast on a quota error", async ({ app }) => {
    await injectWriteError(app, "QuotaExceededError");
    await app.typeInEditor("A change!");

    await expect(app.page.getByText("Browser storage full")).toBeVisible();
    await expect(
      app.page.getByText("Your project edit may not be saved.")
    ).toBeVisible();
    await expect(
      app.page.getByText("An unexpected error occurred")
    ).toBeHidden();
    await app.expectEditorContainText(/A change/);
  });

  test("shows a generic toast on another write error", async ({ app }) => {
    await injectWriteError(app, "UnknownError");
    await app.typeInEditor("A change!");

    await expect(
      app.page.getByText("Failed to save your project to browser storage")
    ).toBeVisible();
    await expect(
      app.page.getByText("An unexpected error occurred")
    ).toBeHidden();
  });
});

/**
 * Makes the next IndexedDB get throw, then restores it. Opening a project
 * reads its record with one, so this fails the load.
 */
const injectReadError = async (app: App) => {
  await app.page.evaluate(() => {
    const original = IDBObjectStore.prototype.get;
    IDBObjectStore.prototype.get = function () {
      IDBObjectStore.prototype.get = original;
      throw new DOMException("Simulated UnknownError", "UnknownError");
    };
  });
};

/**
 * A failed read from the projects database is reported on the page the user
 * is left on, and the project is still there to open.
 */
test.describe("storage read errors", () => {
  test("reports a failed load on going back to the editor from the home page", async ({
    app,
    homePage,
  }) => {
    await app.goHome();
    await homePage.expectOnPage();

    await injectReadError(app);
    await app.page.goBack();

    await expect(
      app.page.getByText("An unexpected error occurred")
    ).toBeVisible();
    await homePage.expectOnPage();
    await homePage.cards.open("Untitled project");
    await app.expectEditorContainText("from microbit import");
  });

  test("warns before closing while an edit has not saved", async ({ app }) => {
    await injectWriteError(app, "UnknownError", { every: true });
    await app.typeInEditor("A change!");
    await expect(
      app.page.getByText("Failed to save your project to browser storage")
    ).toBeVisible();

    await app.closeAndExpectBeforeUnloadPrompt();
  });

  test("does not warn once a later save has succeeded", async ({ app }) => {
    // Only the first save fails. typeInEditor's last keys are typed slowly
    // enough to be saved again, successfully, after it.
    await injectWriteError(app, "UnknownError");
    await app.typeInEditor("A change!");
    await expect(
      app.page.getByText("Failed to save your project to browser storage")
    ).toBeVisible();
    // Past the storage's flush delay, so the last save has finished.
    await app.page.waitForTimeout(600);

    await app.closeWithoutBeforeUnloadPrompt();
  });
});
