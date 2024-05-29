/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { LoadDialogType } from "./app.js";
import { test } from "./app-test-fixtures.js";

test.describe("multiple-files", () => {
  test("Copes with hex with no Python files", async ({ app }) => {
    // Probably best for this to be an error or else we
    // need to cope with no Python at all to display.
    await app.loadFiles("src/micropython/main/microbit-micropython-v2.hex");
    await app.expectAlertText(
      "Cannot load file",
      "No appended code found in the hex file"
    );
  });

  test("Add a new file", async ({ app }) => {
    await app.createNewFile("test");

    await app.expectEditorContainText(/Your new file/);
    await app.expectProjectFiles(["main.py", "test.py"]);
  });

  test("Prevents deleting main.py", async ({ app }) => {
    expect(await app.isDeleteFileOptionDisabled("main.py")).toEqual(true);
  });

  test("Copes with non-main file being updated", async ({ app }) => {
    await app.loadFiles("testData/usermodule.py", {
      acceptDialog: LoadDialogType.CONFIRM_BUT_LOAD_AS_MODULE,
    });
    await app.editFile("usermodule.py");
    await app.expectEditorContainText(/b_works/);

    await app.loadFiles("testData/updated/usermodule.py", {
      acceptDialog: LoadDialogType.CONFIRM_BUT_LOAD_AS_MODULE,
    });

    await app.expectEditorContainText(/c_works/);
  });

  test("Shows warning for third-party module", async ({ app }) => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.editFile("module.py");
    await app.expectThirdPartModuleWarning("a", "1.0.0");

    await app.toggleSettingThirdPartyModuleEditing();
    try {
      await app.expectEditorContainText(/a_works/);
    } finally {
      await app.toggleSettingThirdPartyModuleEditing();
    }

    await app.loadFiles("testData/updated/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.expectThirdPartModuleWarning("a", "1.1.0");
  });

  test("Copes with currently open file being deleted", async ({ app }) => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.editFile("module.py");
    await app.deleteFile("module.py");
    await app.expectEditorContainText(/Hello/);
  });

  test("Muddles through if given non-UTF-8 main.py", async ({ app }) => {
    // We could start detect this on open but not sure it's worth it introducting the error cases.
    // If we need to recreate the hex then just fill the file with 0xff.
    await app.loadFiles("testData/invalid-utf-8.hex");

    await app.expectEditorContainText(
      /^����������������������������������������������������������������������������������������������������$/
    );
  });
});
