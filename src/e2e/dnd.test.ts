/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";
import { App } from "./app.js";

const setupEditorAndSidebar = async (app: App) => {
  await app.selectAllInEditor();
  await app.typeInEditor("#1\n#2\n#3\n");
  await app.expectEditorContainText("#2");
  await app.switchTab("Reference");
  await app.selectDocumentationSection("Display");
};

test.describe("code example drag and drop", () => {
  test("previews the snippet during a drag and reverts on drag out", async ({
    app,
  }) => {
    await setupEditorAndSidebar(app);

    await app.startCodeEmbedDrag("Scroll", 2);
    await expect(app.page.locator(".cm-preview").first()).toBeVisible();
    // Our dropcursor fork suppresses the native drop cursor for snippet
    // drags as the preview takes its place.
    await expect(app.page.locator(".cm-dropCursor")).toHaveCount(0);

    await app.dragCodeEmbedOffEditor();
    await expect(app.page.locator(".cm-preview")).toHaveCount(0);
    await app.endDrag();

    await expect(app.editorTextArea).not.toContainText("display.scroll");
    await expect(app.editorTextArea).not.toContainText("from microbit");
    await app.expectEditorContainText("#2");
  });

  test("drops correctly when the document changes during the drag", async ({
    app,
  }) => {
    await setupEditorAndSidebar(app);

    await app.startCodeEmbedDrag("Scroll", 2);
    await expect(app.page.locator(".cm-preview").first()).toBeVisible();

    // Not something a user can do mid-drag, but stands in for any change to
    // the document while the preview is showing.
    await app.editorTextArea.focus();
    await app.page.keyboard.type("#4");
    await app.expectEditorContainText("#4");

    await app.dropCodeEmbed();
    await expect(app.page.locator(".cm-preview")).toHaveCount(0);
    await expect(
      app.editorTextArea.getByText("display.scroll('score')")
    ).toHaveCount(1);
    await expect(
      app.page.locator(".cm-dropped--recent, .cm-dropped--done").first()
    ).toBeVisible();
    await app.expectEditorContainText("#4");

    // Distinguishes a real drop from preview text left behind, which is
    // not in the history.
    await app.page.keyboard.press(`${app.modifierKey}+z`);
    await expect(app.editorTextArea).not.toContainText("display.scroll");
    await app.expectEditorContainText("#2");
    await app.expectEditorContainText("#4");
  });

  test("reverts the preview when the drag ends without a dragleave", async ({
    app,
  }) => {
    await setupEditorAndSidebar(app);

    await app.startCodeEmbedDrag("Scroll", 2);
    await expect(app.page.locator(".cm-preview").first()).toBeVisible();
    // E.g. the drag was cancelled or dropped elsewhere.
    await app.endDrag();
    await expect(app.page.locator(".cm-preview")).toHaveCount(0);
    await expect(app.editorTextArea).not.toContainText("display.scroll");
    await app.expectEditorContainText("#2");

    // A later drag still works, including after the document changes.
    await app.editorTextArea.focus();
    await app.page.keyboard.type("#4");
    await app.startCodeEmbedDrag("Scroll", 2);
    await expect(app.page.locator(".cm-preview").first()).toBeVisible();
    await app.dropCodeEmbed();
    await app.expectEditorContainText("display.scroll('score')");
    await expect(
      app.page.locator(".cm-dropped--recent, .cm-dropped--done").first()
    ).toBeVisible();
  });

  test("highlights dropped code and undoes the drop in one step", async ({
    app,
  }) => {
    await setupEditorAndSidebar(app);

    await app.dragDropCodeEmbed("Scroll", 2);
    await app.expectEditorContainText("display.scroll('score')");
    await expect(
      app.page.locator(".cm-dropped--recent, .cm-dropped--done").first()
    ).toBeVisible();

    // The preview transactions are excluded from history so a single undo
    // reverts the whole drop, imports included.
    await app.page.keyboard.press(`${app.modifierKey}+z`);
    await expect(app.editorTextArea).not.toContainText("display.scroll");
    await expect(app.editorTextArea).not.toContainText("from microbit");
    await app.expectEditorContainText("#2");
  });
});
