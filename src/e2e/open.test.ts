/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

test.describe("open", () => {
  test("Shows an alert when loading a MakeCode hex", async ({ app }) => {
    await app.loadFiles("testData/makecode.hex");

    await app.expectAlertText(
      "Cannot load file",
      "This hex file cannot be loaded in the Python Editor. The Python Editor cannot open hex files created with Microsoft MakeCode."
    );
  });

  test("Adds a Python file to the project", async ({ app }) => {
    await app.loadFiles("testData/samplefile.py");

    await app.expectAlertText("Added file samplefile.py");
    await app.expectProjectFiles(["main.py", "samplefile.py"]);
    await app.expectProjectName("Untitled project");
  });

  test("Asks before replacing a file with the same name", async ({ app }) => {
    await app.loadFiles("testData/samplefile.py");
    await app.expectAlertText("Added file samplefile.py");

    await app.loadFiles("testData/samplefile.py");
    await app.expectDialog("Replace existing files?");
    await app.answerDialog("Cancel");
    await app.expectProjectFiles(["main.py", "samplefile.py"]);

    await app.loadFiles("testData/samplefile.py");
    await app.expectDialog("Replace existing files?");
    await app.answerDialog("Replace");
    await app.expectAlertText("Updated file samplefile.py");
  });

  test("Correctly handles a hex that's actually Python", async ({ app }) => {
    await app.loadFiles("testData/not-a-hex.hex");

    await app.expectAlertText(
      "Cannot load file",
      // Would be great to have custom messages here but needs error codes
      // pushing into microbit-fs.
      "Malformed .hex file, could not parse any registers"
    );
  });

  test("Opens a v1.0.1 hex file as a new project", async ({
    app,
    homePage,
  }) => {
    await app.typeInEditor("# Keep me");
    await app.loadFiles("testData/1.0.1.hex");

    await app.expectEditorContainText(/PASS1/);
    await app.expectProjectName("1.0.1");

    // The previous project is untouched.
    await app.goHome();
    await homePage.cards.expectVisible("1.0.1");
    await homePage.cards.open("Untitled project");
    await app.expectEditorContainText("# Keep me");
  });

  test("Opens a v0.9 hex file as a new project", async ({ app }) => {
    await app.loadFiles("testData/0.9.hex");

    await app.expectEditorContainText(/PASS2/);
    await app.expectProjectName("0.9");
  });

  test("Opens a hex via drag and drop", async ({ app }) => {
    await app.dropFile("testData/1.0.1.hex");

    await app.expectProjectName("1.0.1");
  });

  test("Correctly handles an mpy file", async ({ app }) => {
    await app.loadFiles("testData/samplempyfile.mpy");

    await app.expectAlertText(
      "Cannot load file",
      "This version of the Python Editor doesn't currently support adding .mpy files."
    );
  });

  test("Correctly handles a file with an invalid extension", async ({
    app,
  }) => {
    await app.loadFiles("testData/sampletxtfile.txt");

    expect(await app.isEditFileOptionDisabled("sampletxtfile.txt")).toEqual(
      true
    );
  });

  test("Correctly imports modules with the 'magic comment' in the filesystem.", async ({
    app,
  }) => {
    await app.loadFiles("testData/module.py");

    await app.expectAlertText("Added file module.py");

    await app.loadFiles("testData/module.py");
    await app.answerDialog("Replace");
    await app.expectAlertText("Updated file module.py");
  });
});
