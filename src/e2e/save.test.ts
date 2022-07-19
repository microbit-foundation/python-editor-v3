/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App, LoadDialogType } from "./app";

describe("Browser - save", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Download - save the default HEX asd", async () => {
    await app.setProjectName("idiosyncratic ruminant");
    const download = await app.waitForSave();

    expect(download.filename).toEqual("idiosyncratic ruminant.hex");
    expect(download.data.toString("ascii")).toMatch(/^:020000040000FA/);
  });

  it("Shows an error when trying to save a hex file if the Python code is too large", async () => {
    // Set the project name to avoid calling the edit project name input dialog.
    await app.setProjectName("not default name");
    await app.loadFiles("testData/too-large.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.findVisibleEditorContents(/# Filler/);
    await app.save();

    await app.findAlertText(
      "Failed to build the hex file",
      "There is no storage space left."
    );
  });

  it("Shows the name your project dialog if the project name is the default", async () => {
    await app.save();
    await app.confirmNameYourProjectDialog();
  });

  it("Shows the post-save dialog after hex save", async () => {
    await app.setProjectName("not default name");
    await app.save();
    await app.confirmPostSaveDialog();
  });
});
