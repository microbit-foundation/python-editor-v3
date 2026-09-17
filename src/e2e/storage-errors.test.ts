/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { App } from "./app.js";
import { test } from "./app-test-fixtures.js";

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

  test("retains text across a reload via session storage", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.page.reload();

    await app.expectEditorContainText(/A change/);
  });
});

/**
 * Makes the next IndexedDB put throw, then restores it. The first put in a
 * project flush is the project record, so this fails the whole flush.
 */
const injectWriteError = async (
  app: App,
  errorName: "QuotaExceededError" | "UnknownError"
) => {
  await app.page.evaluate((errorName) => {
    const original = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () {
      IDBObjectStore.prototype.put = original;
      throw new DOMException(`Simulated ${errorName}`, errorName);
    };
  }, errorName);
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
