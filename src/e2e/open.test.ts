/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { LoadDialogType } from "./app-playwright.js";
import { test } from "./app-test-fixtures.js";

test.describe("open", () => {
  test.beforeEach(async ({ app }) => {
    await app.goto();
  });

  test("Shows an alert when loading a MakeCode hex", async ({ app }) => {
    await app.loadFiles("testData/makecode.hex");

    await app.findAlertText(
      "Cannot load file",
      "This hex file cannot be loaded in the Python Editor. The Python Editor cannot open hex files created with Microsoft MakeCode."
    );
  });

  test("Loads a Python file", async ({ app }) => {
    await app.loadFiles("testData/samplefile.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.findAlertText("Updated file main.py");
    await app.findProjectName("Untitled project");
  });

  test("Correctly handles a hex that's actually Python", async ({ app }) => {
    await app.loadFiles("testData/not-a-hex.hex", {
      acceptDialog: LoadDialogType.NONE,
    });

    await app.findAlertText(
      "Cannot load file",
      // Would be great to have custom messages here but needs error codes
      // pushing into microbit-fs.
      "Malformed .hex file, could not parse any registers"
    );
  });

  test("Loads a v1.0.1 hex file", async ({ app }) => {
    await app.loadFiles("testData/1.0.1.hex");

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  test("Loads a v0.9 hex file", async ({ app }) => {
    await app.loadFiles("testData/0.9.hex");

    await app.findVisibleEditorContents(/PASS2/);
    await app.findProjectName("0.9");
  });

  test("Loads via drag and drop", async ({ app }) => {
    await app.dropFile("testData/1.0.1.hex");

    await app.findProjectName("1.0.1");
    // await app.findVisibleEditorContents(/PASS1/);
  });

  test("Correctly handles an mpy file", async ({ app }) => {
    await app.loadFiles("testData/samplempyfile.mpy", {
      acceptDialog: LoadDialogType.NONE,
    });

    await app.findAlertText(
      "Cannot load file",
      "This version of the Python Editor doesn't currently support adding .mpy files."
    );
  });

  test("Correctly handles a file with an invalid extension", async ({
    app,
  }) => {
    await app.loadFiles("testData/sampletxtfile.txt", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    expect(await app.isEditFileOptionDisabled("sampletxtfile.txt")).toEqual(
      true
    );
  });

  test("Correctly imports modules with the 'magic comment' in the filesystem.", async ({
    app,
  }) => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.findAlertText("Added file module.py");

    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.findAlertText("Updated file module.py");
  });

  test("Warns before load if you have changes", async ({ app }) => {
    await app.typeInEditor("# Different text");
    await app.loadFiles("testData/1.0.1.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });
    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  test("No warn before load if you save hex", async ({ app }) => {
    await app.setProjectName("Avoid dialog");
    await app.typeInEditor("# Different text");
    await app.save();
    await app.closeDialog("Project saved");

    // No dialog accepted
    await app.loadFiles("testData/1.0.1.hex");
    await app.findVisibleEditorContents(/PASS1/);
  });

  test("No warn before load if you save main file", async ({ app }) => {
    await app.setProjectName("Avoid dialog");
    await app.typeInEditor("# Different text");
    await app.saveMain();

    // No dialog accepted
    await app.loadFiles("testData/1.0.1.hex");
    await app.findVisibleEditorContents(/PASS1/);
  });

  test("Warn before load if you save main file only and you have others", async ({
    app,
  }) => {
    await app.setProjectName("Avoid dialog");
    await app.typeInEditor("# Different text");
    await app.createNewFile("another");
    await app.saveMain();
    await app.closeDialog("Warning: Only main.py downloaded");

    await app.loadFiles("testData/1.0.1.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });
    await app.findVisibleEditorContents(/PASS1/);
  });
});
