/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { escapeRegExp } from "../editor/codemirror/language-server/regexp-util";
import { App, defaultRootUrl } from "./app";

describe("Browser - toolkit tabs", () => {
  // Enable flags to allow testing the toolkit interactions.
  const app = new App(defaultRootUrl + "?flag=*");
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
    await app.switchTab("micro:bit");
    await app.selectToolkitSection("Display");
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");

    await app.insertToolkitCode("Images: built-in");

    await app.findVisibleEditorContents("display.show(Image.HEART)");
  });

  it("Insert code after dropdown choice", async () => {
    await app.switchTab("micro:bit");
    await app.selectToolkitSection("Display");
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");

    await app.selectToolkitDropDownOption("Show example for:", "Image.SILLY");
    await app.insertToolkitCode("Images: built-in");

    await app.findVisibleEditorContents("display.show(Image.SILLY)");
  });
});
