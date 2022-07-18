/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App, LoadDialogType } from "./app";

describe("Browser - open", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Shows an alert when loading a MakeCode hex", async () => {
    await app.loadFiles("testData/makecode.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });

    // We should improve this and reference MakeCode.
    // v2 adds some special case translatable text.
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

  it("Loads a v1.0.1 hex file", async () => {
    await app.loadFiles("testData/1.0.1.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });

    await app.findVisibleEditorContents(/PASS1/);
    await app.findProjectName("1.0.1");
  });

  it("Loads a v0.9 hex file", async () => {
    await app.loadFiles("testData/0.9.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });

    await app.findVisibleEditorContents(/PASS2/);
    await app.findProjectName("0.9");
  });

  it("Loads via drag and drop", async () => {
    await app.dropFile("testData/1.0.1.hex", {
      acceptDialog: LoadDialogType.REPLACE,
    });

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
});
