/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";
import { expect } from "@playwright/test";

test.describe("accessibility", () => {
  test("focuses the correct element on tabbing after load", async ({ app }) => {
    await app.expectFocusOnLoad();
  });

  test("focuses the correct elements on collapsing and expanding the simulator", async ({
    app,
  }) => {
    await app.simulator.collapseButton.click();
    await expect(app.simulator.expandButton).toBeFocused();

    await app.simulator.expandButton.click();
    await expect(app.simulator.iframe).toBeFocused();
  });

  test("focuses the correct elements on collapsing and expanding the sidebar", async ({
    app,
  }) => {
    await app.sidebar.expandButton.click();
    await app.assertFocusOnSidebar();

    await app.sidebar.collapseButton.click();
    await expect(app.sidebar.expandButton).toBeFocused();
  });

  test("allows tab out of editor", async ({ app }) => {
    await app.tabOutOfEditorForwards();
    await app.assertFocusAfterEditor();

    await app.tabOutOfEditorBackwards();
    await app.assertFocusBeforeEditor();
  });
});
