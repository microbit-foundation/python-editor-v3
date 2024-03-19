/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import fs from "fs";
import { LoadDialogType } from "./app.js";
import { test } from "./app-test-fixtures.js";

test.describe("save", () => {
  test("Download - save the default HEX asd", async ({ app }) => {
    await app.setProjectName("idiosyncratic ruminant");
    const download = await app.save();
    if (!download) {
      throw new Error("Invalid download");
    }
    const filename = download.suggestedFilename();
    expect(filename).toEqual("idiosyncratic ruminant.hex");

    const path = await download.path();
    if (!path) {
      throw new Error("Invalid path");
    }
    const contents = await fs.promises.readFile(path, { encoding: "ascii" });
    expect(contents).toMatch(/^:020000040000FA/);
  });

  test("Shows an error when trying to save a hex file if the Python code is too large", async ({
    app,
  }) => {
    // Set the project name to avoid calling the edit project name input dialog.
    await app.setProjectName("not default name");
    await app.loadFiles("testData/too-large.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.expectEditorContainText(/# Filler/);
    await app.save({ waitForDownload: false });

    await app.expectAlertText(
      "Failed to build the hex file",
      "There is no storage space left."
    );
  });

  test("Shows the name your project dialog if the project name is the default", async ({
    app,
  }) => {
    await app.save({ waitForDownload: false });
    await app.expectDialog("Name your project");
  });

  test("Shows the post-save dialog after hex save", async ({ app }) => {
    await app.setProjectName("not default name");
    await app.save();
    await app.expectDialog("Project saved");
  });

  test("Shows the multiple files dialog after main.py save if there are multiple files in the project", async ({
    app,
  }) => {
    await app.setProjectName("not default name");
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.savePythonScript();
    await app.expectDialog("Warning: Only main.py downloaded");
  });
});
