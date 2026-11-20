/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("edits", () => {
  test("doesn't prompt on close if no edits made", async ({ app }) => {
    await app.closeWithoutBeforeUnloadPrompt();
  });

  test("doesn't prompt on close if file edited, as the project is saved", async ({
    app,
  }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.closeWithoutBeforeUnloadPrompt();
  });

  test("doesn't prompt on close if project name edited, as the project is saved", async ({
    app,
  }) => {
    const name = "idiosyncratic ruminant";
    await app.setProjectName(name);
    await app.expectProjectName(name);

    await app.closeWithoutBeforeUnloadPrompt();
  });

  test("retains text across a reload", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.page.reload();

    await app.expectEditorContainText(/A change/);
  });

  test("retains text across a reload straight after typing", async ({
    app,
  }) => {
    // Writes are coalesced for a few hundred milliseconds, so this relies on
    // the pending ones being flushed as the page unloads. The clock is held
    // so the write cannot land by its timer first. It can only be held at a
    // time the page has not reached, hence the margin.
    await app.page.clock.install();
    await app.page.clock.pauseAt(Date.now() + 1000);
    await app.editorTextArea.fill("A change!");
    await app.page.reload();
    await app.page.clock.resume();

    await app.expectEditorContainText(/A change/);
  });
});
