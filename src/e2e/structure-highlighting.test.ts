/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

const nestedProgram = "while True:\n    if True:\n        pass";

test.describe("structure highlighting", () => {
  test("draws indented blocks for nested statements", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor(nestedProgram);

    const bodies = app.page.locator(".cm-cs--body");
    await expect(app.page.locator(".cm-cs--parent")).toHaveCount(2);
    await expect(bodies).toHaveCount(2);

    // Drawn outermost first; the nested body is indented further.
    const lefts = await bodies.evaluateAll((elements) =>
      elements.map((e) => parseFloat((e as HTMLElement).style.left))
    );
    expect(lefts[1]).toBeGreaterThan(lefts[0]);
  });

  test("marks the innermost block containing the cursor as active", async ({
    app,
  }) => {
    await app.selectAllInEditor();
    // Leaves the cursor at the end, inside the if body.
    await app.typeInEditor(nestedProgram);

    const bodies = app.page.locator(".cm-cs--body");
    await expect(bodies).toHaveCount(2);
    await expect(bodies.nth(1)).toHaveClass(/cm-cs--active/);
    await expect(bodies.nth(0)).not.toHaveClass(/cm-cs--active/);

    // Moving the cursor to the while line moves the highlight.
    await app.page.getByText("while True:").click();
    await expect(bodies.nth(0)).toHaveClass(/cm-cs--active/);
    await expect(bodies.nth(1)).not.toHaveClass(/cm-cs--active/);
  });

  test("follows the highlight code structure setting", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor(nestedProgram);
    await expect(
      app.page.locator(".cm-cs--layer.cm-cs--mode-full")
    ).toHaveCount(1);

    await app.page.getByTestId("settings").click();
    await app.page.getByRole("menuitem", { name: "Settings" }).click();
    const select = app.page.getByLabel("Highlight code structure");
    await select.selectOption("simple");
    await expect(
      app.page.locator(".cm-cs--layer.cm-cs--mode-simple")
    ).toHaveCount(1);

    await select.selectOption("none");
    await expect(app.page.locator(".cm-cs--layer")).toHaveCount(0);
  });
});
