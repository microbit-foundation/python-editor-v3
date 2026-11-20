/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

test.describe("documentation", () => {
  test("API toolkit navigation", async ({ app }) => {
    await app.switchTab("API");
    await app.expectDocumentationTopLevelHeading(
      "API",
      "For usage and examples, see"
    );
    await app.expectNoNewAccessibilityViolations();
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
    await app.expectNoNewAccessibilityViolations();
  });

  test("Ideas tab navigation", async ({ app }) => {
    await app.switchTab("Ideas");
    await app.expectDocumentationTopLevelHeading(
      "Ideas",
      "Try out these projects, modify them and get inspired"
    );
  });

  test("Ideas tab explains that ideas are moving to the home page", async ({
    app,
  }) => {
    await app.switchTab("Ideas");
    await expect(
      app.page.getByText("Ideas are moving to the Home page.")
    ).toBeVisible();
    await app.expectNoNewAccessibilityViolations();

    const learnMore = app.page.getByRole("button", { name: "Learn more" });
    await learnMore.click();
    const dialog = app.page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: "Ideas are moving to the Home page" })
    ).toBeVisible();
    await app.expectNoNewAccessibilityViolations();

    await app.page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(learnMore).toBeFocused();
  });

  test("Select an idea", async ({ app }) => {
    const ideaName = "Emotion badge";
    await app.switchTab("Ideas");
    await app.selectDocumentationIdea(ideaName);
    await app.expectDocumentationTopLevelHeading(ideaName);
    await app.expectNoNewAccessibilityViolations();
  });
});
