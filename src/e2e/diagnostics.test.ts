/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";
import { App } from "./app.js";

// Escape dismisses autocomplete so that Enter inserts a newline rather than
// accepting a completion; the cursor then moves off the offending line,
// otherwise the gutter shows the typing indicator rather than the error.
const typeCodeWithError = async (app: App) => {
  await app.selectAllInEditor();
  await app.typeInEditor("from microbit import *\nfoo");
  await app.page.keyboard.press("Escape");
  await app.page.keyboard.press("Enter");
};

test.describe("diagnostics", () => {
  test("shows an error marker and underline for invalid code", async ({
    app,
  }) => {
    await typeCodeWithError(app);

    await expect(app.page.locator(".cm-lint-marker-error")).toBeVisible();
    await expect(app.page.locator(".cm-lintRange-error")).toBeVisible();
  });

  test("shows a typing indicator while editing the line", async ({ app }) => {
    await app.selectAllInEditor();
    // No Enter: the cursor stays on the offending line.
    await app.typeInEditor("from microbit import *\nfoo");

    await expect(app.page.locator(".cm-lint-marker-editing")).toBeVisible();
    await expect(app.page.locator(".cm-lint-marker-error")).toHaveCount(0);

    // Moving to another line reveals the real severity. Escape first so
    // ArrowUp moves the cursor rather than navigating autocomplete.
    await app.page.keyboard.press("Escape");
    await app.page.keyboard.press("ArrowUp");
    await expect(app.page.locator(".cm-lint-marker-error")).toBeVisible();
    await expect(app.page.locator(".cm-lint-marker-editing")).toHaveCount(0);
  });

  test("clears the marker when the code is fixed", async ({ app }) => {
    await typeCodeWithError(app);
    await expect(app.page.locator(".cm-lint-marker-error")).toBeVisible();

    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.show(1)");
    await app.page.keyboard.press("Escape");
    await app.page.keyboard.press("Enter");
    await expect(app.page.locator(".cm-lint-marker")).toHaveCount(0);
  });

  test("shows the message when hovering the gutter marker", async ({ app }) => {
    await typeCodeWithError(app);

    const marker = app.page.locator(".cm-lint-marker-error");
    await expect(marker).toBeVisible();
    await marker.hover();
    await expect(app.page.locator(".cm-tooltip-lint")).toContainText("foo");
  });
});
