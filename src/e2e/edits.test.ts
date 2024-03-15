/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("edits", () => {
  test("doesn't prompt on close if no edits made", async ({ app }) => {
    await app.closePageCheckDialog(false);
  });

  test("prompts on close if file edited", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.closePageCheckDialog(true);
  });

  test("prompts on close if project name edited", async ({ app }) => {
    const name = "idiosyncratic ruminant";
    await app.setProjectName(name);
    await app.expectProjectName(name);

    await app.closePageCheckDialog(true);
  });

  test("retains text across a reload via session storage", async ({ app }) => {
    await app.typeInEditor("A change!");
    await app.expectEditorContainText(/A change/);

    await app.page.reload();

    await app.expectEditorContainText(/A change/);
  });
});
