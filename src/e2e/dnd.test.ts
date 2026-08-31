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
