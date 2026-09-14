/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
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

  test("retains text across a reload via session storage", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.page.reload();

    await app.expectEditorContainText(/A change/);
  });
});
