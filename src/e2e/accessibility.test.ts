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

// Most states are scanned by the scenario that reaches them. These are the
// ones the page object's helpers pass straight through.
test.describe("accessibility scans", () => {
  test("initial load", async ({ app }) => {
    await app.saveButton.waitFor();
    await app.expectNoNewAccessibilityViolations();
  });

  test("settings menu and dialog", async ({ app }) => {
    await app.page.getByTestId("settings").click();
    const settings = app.page.getByRole("menuitem", { name: "Settings" });
    await settings.waitFor();
    await app.expectNoNewAccessibilityViolations();

    await settings.click();
    await app.page.getByText("Font size").waitFor();
    await app.expectNoNewAccessibilityViolations();
  });

  test("language dialog", async ({ app }) => {
    await app.page.getByTestId("settings").click();
    await app.page.getByTestId("language").click();
    await app.page.getByTestId("fr").waitFor();
    await app.expectNoNewAccessibilityViolations();
  });

  test("connect dialog", async ({ app }) => {
    await app.page.getByTestId("more-connect-options").click();
    const connect = app.page.getByRole("menuitem", { name: "Connect" });
    await connect.waitFor();
    await app.expectNoNewAccessibilityViolations();

    await connect.click();
    const next = app.page.getByRole("button", { name: "Next" });
    await next.waitFor();
    await app.expectNoNewAccessibilityViolations();

    await next.click();
    await app.page.getByRole("button", { name: "Back" }).waitFor();
    await app.expectNoNewAccessibilityViolations();
  });

  test("create file dialog", async ({ app }) => {
    await app.switchTab("Project");
    await app.page.getByRole("button", { name: "Create file" }).click();
    const name = app.page.getByLabel("Name*");
    await name.waitFor();
    await app.expectNoNewAccessibilityViolations();

    await name.fill("not a valid name!");
    await app.expectNoNewAccessibilityViolations();
  });

  test("file actions menu", async ({ app }) => {
    await app.switchTab("Project");
    await app.projectTab.openFileActionsMenu("main.py");
    await app.expectNoNewAccessibilityViolations();
  });

  test("search results", async ({ app }) => {
    await app.search("loop");
    await app.page.getByRole("dialog").getByRole("link").first().waitFor();
    await app.expectNoNewAccessibilityViolations();
  });
});
