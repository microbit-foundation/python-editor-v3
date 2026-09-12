/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { appUrl, homeUrl } from "./app.js";
import { test } from "./app-test-fixtures.js";

const heartMigrationFragment =
  "#project:XQAAgACRAAAAAAAAAAA9iImmlGSt1R++5LD+ZJ36cRz46B+lhYtNRoWF0nijpaVyZlK7ACfSpeoQpgfk21st4ty06R4PEOM4sSAXBT95G3en+tghrYmE+YJp6EiYgzA9ThKkyShWq2UdvmCzqxoNfYc1wlmTqlNv/Piaz3WoSe3flvr/ItyLl0aolQlEpv4LA8A=";

test.describe("routing", () => {
  test.use({ autoGoto: false });

  test("redirects the editor's old documentation URLs", async ({ app }) => {
    await app.page.goto(appUrl("reference/display"));
    await expect(app.page).toHaveURL(/\/project\/reference\/display/);
    await expect(
      app.page.getByRole("tab", { name: "Reference" })
    ).toHaveAttribute("aria-selected", "true");
  });

  test("shows not found for an unknown page", async ({ app }) => {
    await app.page.goto(appUrl("nonsense/whatever/else"));
    await expect(
      app.page.getByRole("heading", { name: "Page not found" })
    ).toBeVisible();
  });

  test("a #project: link at the root opens the program in the editor", async ({
    app,
  }) => {
    await app.page.goto(homeUrl({ fragment: heartMigrationFragment }));
    await expect(app.page).toHaveURL(/\/project(\?|$)/);
    await app.expectProjectName("Hearts");
    await app.expectEditorContainText("display.show(Image.HEART)");
  });

  test("a new tab at the editor opens the most recent project", async ({
    app,
    homePage,
  }) => {
    await homePage.goto();
    await homePage.newProject("Most recent");
    await app.expectProjectName("Most recent");

    // Session storage is per tab, so a new page has no current project.
    const other = await app.context.newPage();
    const otherApp = new (await import("./app.js")).App(other, app.context);
    await otherApp.goto();
    await otherApp.expectProjectName("Most recent");
  });
});
