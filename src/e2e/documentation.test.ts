/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("documentation", () => {
  test("API toolkit navigation", async ({ app }) => {
    await app.switchTab("API");
    await app.expectDocumentationTopLevelHeading(
      "API",
      "For usage and examples, see"
    );
  });

  test("Copy code and paste in editor", async ({ app }) => {
    const tab = "Reference";
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");
    await app.switchTab(tab);
    await app.selectDocumentationSection("Display");
    await app.toggleCodeActionButton("Images: built-in");
    await app.copyCode("Images: built-in");
    await app.pasteInEditor();
    await app.expectEditorContainText("display.show(Image.HEART)");
  });

  test("Copy code after dropdown choice and paste in editor", async ({
    app,
  }) => {
    const tab = "Reference";
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");
    await app.switchTab(tab);
    await app.selectDocumentationSection("Display");
    await app.selectToolkitDropDownOption(
      "Select image:",
      "silly" // "Image.SILLY"
    );
    await app.toggleCodeActionButton("Images: built-in");
    await app.copyCode("Images: built-in");

    await app.pasteInEditor();
    await app.expectEditorContainText("display.show(Image.SILLY)");
  });

  test("Insert code via drag and drop", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("#1\n#2\n#3\n");
    await app.expectEditorContainText("#2");
    await app.switchTab("Reference");
    await app.selectDocumentationSection("Display");
    await app.dragDropCodeEmbed("Scroll", 2);

    // There's some weird trailing whitespace in this snippet that needs fixing in the content.
    const expected =
      "from microbit import *display.scroll('score')    display.scroll(23)#1#2#3";

    await app.expectEditorContainText(expected);
  });

  test("Searches and navigates to the first result", async ({ app }) => {
    await app.search("loop");
    await app.selectFirstSearchResult();
    await app.expectDocumentationTopLevelHeading(
      "Loops",
      "Count and repeat sets of instructions"
    );
  });

  test("Ideas tab navigation", async ({ app }) => {
    await app.switchTab("Ideas");
    await app.expectDocumentationTopLevelHeading(
      "Ideas",
      "Try out these projects, modify them and get inspired"
    );
  });

  test("Select an idea", async ({ app }) => {
    const ideaName = "Emotion badge";
    await app.switchTab("Ideas");
    await app.selectDocumentationIdea(ideaName);
    await app.expectDocumentationTopLevelHeading(ideaName);
  });
});
