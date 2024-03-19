/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("reset", () => {
  test("sets language via URL", async ({ app }) => {
    await app.setProjectName("My project");
    await app.selectAllInEditor();
    await app.typeInEditor("# Not the default starter code");
    await app.createNewFile("testing");

    await app.resetProject();

    // Everything's back to normal.
    await app.expectProjectName("Untitled project");
    await app.expectEditorContainText("from microbit import");
    await app.expectProjectFiles(["main.py"]);
  });
});
