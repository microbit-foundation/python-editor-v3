/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("documentation", () => {
  test.beforeEach(async ({ app }) => {
    await app.goto();
  });

  test("API toolkit navigation", async ({ app }) => {
    await app.switchTab("API");
    await app.findDocumentationTopLevelHeading(
      "API",
      "For usage and examples, see"
    );
  });

  test("Copy code and paste in editor", async ({ app, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const tab = "Reference";
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");
    await app.switchTab(tab);
    await app.selectDocumentationSection("Display");
    await app.triggerScroll(tab);
    await app.toggleCodeActionButton("Images: built-in");
    await app.copyCode("Images: built-in");
    await app.pasteToolkitCode();
    await app.findVisibleEditorContents("display.show(Image.HEART)");
  });

  test("Copy code after dropdown choice and paste in editor", async ({
    app,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const tab = "Reference";
    await app.selectAllInEditor();
    await app.typeInEditor("# Initial document");
    await app.switchTab(tab);
    await app.selectDocumentationSection("Display");
    await app.triggerScroll(tab);
    await app.selectToolkitDropDownOption(
      "Select image:",
      "silly" // "Image.SILLY"
    );
    await app.toggleCodeActionButton("Images: built-in");
    await app.copyCode("Images: built-in");

    await app.pasteToolkitCode();
    await app.findVisibleEditorContents("display.show(Image.SILLY)");
  });

  test("Insert code via drag and drop", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor("#1\n#2\n#3\n");
    await app.findVisibleEditorContents("#2");
    await app.switchTab("Reference");
    await app.selectDocumentationSection("Display");
    await app.dragDropCodeEmbed("Scroll", 2);

    // There's some weird trailing whitespace in this snippet that needs fixing in the content.
    const expected =
      "from microbit import *display.scroll('score')    display.scroll(23)#1#2#3";

    await app.findVisibleEditorContents(expected);
  });

  test("Searches and navigates to the first result", async ({ app }) => {
    await app.searchToolkits("loop");
    await app.selectFirstSearchResult();
    await app.findDocumentationTopLevelHeading(
      "Loops",
      "Count and repeat sets of instructions"
    );
  });

  test("Ideas tab navigation", async ({ app }) => {
    await app.switchTab("Ideas");
    await app.findDocumentationTopLevelHeading(
      "Ideas",
      "Try out these projects, modify them and get inspired"
    );
  });

  test("Select an idea", async ({ app }) => {
    const ideaName = "Emotion badge";
    await app.switchTab("Ideas");
    await app.selectDocumentationIdea(ideaName);
    await app.findDocumentationTopLevelHeading(ideaName);
  });
});
