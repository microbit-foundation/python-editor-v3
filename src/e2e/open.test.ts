/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App, LoadDialogType } from "./app";

describe("open", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Shows an alert when loading a MakeCode hex", async () => {
    await app.loadFiles("testData/makecode.hex");

    await app.findAlertText(
      "Cannot load file",
      "This hex file cannot be loaded in the Python Editor. The Python Editor cannot open hex files created with Microsoft MakeCode."
    );
  });

  it("Loads a Python file", async () => {
    await app.loadFiles("testData/samplefile.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.findAlertText("Updated file main.py");
    await app.findProjectName("Untitled project");
  });

  it("Correctly handles a hex that's actually Python", async () => {
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

  it("Loads a v1.0.1 hex file", async () => {
    await app.loadFiles("testData/1.0.1.hex");

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("Loads a v0.9 hex file", async () => {
    await app.loadFiles("testData/0.9.hex");

    await app.findVisibleEditorContents(/PASS2/);
    await app.findProjectName("0.9");
  });

  it("Loads via drag and drop", async () => {
    await app.dropFile("testData/1.0.1.hex");

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("Correctly handles an mpy file", async () => {
    await app.loadFiles("testData/samplempyfile.mpy", {
      acceptDialog: LoadDialogType.NONE,
    });

    await app.findAlertText(
      "Cannot load file",
      "This version of the Python Editor doesn't currently support adding .mpy files."
    );
  });

  it("Correctly handles a file with an invalid extension", async () => {
    await app.loadFiles("testData/sampletxtfile.txt", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    expect(await app.canSwitchToEditing("sampletxtfile.txt")).toEqual(false);
  });

  it("Correctly imports modules with the 'magic comment' in the filesystem.", async () => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });

    await app.findAlertText("Added file module.py");

    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.findAlertText("Updated file module.py");
  });

  it("Warns before load if you have changes", async () => {
    await app.typeInEditor("# Different text");
    await app.loadFiles("testData/1.0.1.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });
    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("No warn before load if you save hex", async () => {
    await app.setProjectName("Avoid dialog");
    await app.typeInEditor("# Different text");
    await app.save();
    await app.closeDialog("Project saved");

    // No dialog accepted
    await app.loadFiles("testData/1.0.1.hex");
    await app.findVisibleEditorContents(/PASS1/);
  });

  it("No warn before load if you save main file", async () => {
    await app.setProjectName("Avoid dialog");
    await app.typeInEditor("# Different text");
    await app.saveMain();

    // No dialog accepted
    await app.loadFiles("testData/1.0.1.hex");
    await app.findVisibleEditorContents(/PASS1/);
  });

  it("Warn before load if you save main file only and you have others", async () => {
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
