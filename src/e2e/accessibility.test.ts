/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("accessibility", () => {
  test("focuses the correct element on tabbing after load", async ({ app }) => {
    await app.assertFocusOnLoad();
  });

  test("focuses the correct elements on collapsing and expanding the simulator", async ({
    app,
  }) => {
    await app.collapseSimulator();
    await app.assertFocusOnExpandSimulator();

    await app.expandSimulator();
    await app.assertFocusOnSimulator();
  });

  test("focuses the correct elements on collapsing and expanding the sidebar", async ({
    app,
  }) => {
    await app.expandSidebar();
    await app.assertFocusOnSidebar();

    await app.collapseSidebar();
    await app.assertFocusOnExpandSidebar();
  });

  test("allows tab out of editor", async ({ app }) => {
    await app.tabOutOfEditorForwards();
    await app.assertFocusAfterEditor();

    await app.tabOutOfEditorBackwards();
    await app.assertFocusBeforeEditor();
  });
});
