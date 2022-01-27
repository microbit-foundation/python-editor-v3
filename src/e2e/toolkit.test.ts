/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - toolkit tabs", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Reference toolkit navigation", async () => {
    await app.switchTab("Reference");
    await app.findToolkitTopLevelHeading(
      "Reference",
      "Reference documentation for micro:bit MicroPython"
    );
  });

  it("Insert code", async () => {
    await app.switchTab("Explore");
    await app.selectToolkitSection("Display");
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");

    await app.insertToolkitCode("Images: built-in");

    await app.findVisibleEditorContents("display.show(Image.HEART)");
  });

  it("Insert code after dropdown choice", async () => {
    await app.switchTab("Explore");
    await app.selectToolkitSection("Display");
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");

    await app.selectToolkitDropDownOption(
      "Use the dropdown to try different images:",
      "9" // "Image.SILLY"
    );
    await app.insertToolkitCode("Images: built-in");

    await app.findVisibleEditorContents("display.show(Image.SILLY)");
  });

  it("Insert code via drag and drop", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor("#1\n#2\n#3\n");
    await app.findVisibleEditorContents("#2");
    await app.switchTab("Explore");
    await app.selectToolkitSection("Display");

    await app.dragDropToolkitCode("Scroll", 2);

    // There's some weird trailing whitespace in this snippet that needs fixing in the content.
    const expected =
      "from microbit import *\n\n\ndisplay.scroll('score')    \ndisplay.scroll(23)\n#1\n#2\n#3\n";

    await app.findVisibleEditorContents(expected);
  });

  it("Searches and navigates to the first result", async () => {
    await app.searchToolkits("loop");
    await app.selectFirstSearchResult();
    await app.findToolkitTopLevelHeading(
      "Loops",
      "Count and repeat sets of instructions"
    );
  });
});
