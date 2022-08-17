/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App, LoadDialogType } from "./app";

describe("Browser - multiple and missing file cases", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Copes with hex with no Python files", async () => {
    // Probably best for this to be an error or else we
    // need to cope with no Python at all to display.
    await app.loadFiles("src/micropython/main/microbit-micropython-v2.hex");

    await app.findAlertText(
      "Cannot load file",
      "No appended code found in the hex file"
    );
  });

  it("Add a new file", async () => {
    await app.createNewFile("test");

    await app.findVisibleEditorContents(/Your new file/);
    await app.findProjectFiles(["main.py", "test.py"]);
  });

  it("Prevents deleting main.py", async () => {
    expect(await app.canDeleteFile("main.py")).toEqual(false);
  });

  it("Copes with non-main file being updated", async () => {
    await app.loadFiles("testData/usermodule.py", {
      acceptDialog: LoadDialogType.CONFIRM_BUT_LOAD_AS_MODULE,
    });
    await app.switchToEditing("usermodule.py");
    await app.findVisibleEditorContents(/b_works/);

    await app.loadFiles("testData/updated/usermodule.py", {
      acceptDialog: LoadDialogType.CONFIRM_BUT_LOAD_AS_MODULE,
    });

    await app.findVisibleEditorContents(/c_works/);
  });

  it("Shows warning for third-party module", async () => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.switchToEditing("module.py");
    await app.findThirdPartyModuleWarning("a", "1.0.0");

    await app.toggleSettingThirdPartyModuleEditing();
    try {
      await app.findVisibleEditorContents(/a_works/);
    } finally {
      await app.toggleSettingThirdPartyModuleEditing();
    }

    await app.loadFiles("testData/updated/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.findThirdPartyModuleWarning("a", "1.1.0");
  });

  it("Copes with currently open file being deleted", async () => {
    await app.loadFiles("testData/module.py", {
      acceptDialog: LoadDialogType.CONFIRM,
    });
    await app.switchToEditing("module.py");

    await app.deleteFile("module.py");

    await app.findVisibleEditorContents(/Hello/);
  });

  it("Muddles through if given non-UTF-8 main.py", async () => {
    // We could start detect this on open but not sure it's worth it introducting the error cases.
    // If we need to recreate the hex then just fill the file with 0xff.
    await app.loadFiles("testData/invalid-utf-8.hex");

    await app.findVisibleEditorContents(
      /^����������������������������������������������������������������������������������������������������$/
    );
  });
});
