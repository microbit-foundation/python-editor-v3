/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

test.describe("settings", () => {
  test("sets language via URL", async ({ app }) => {
    await app.goto({ language: "fr" });
    // French via the URL
    await app.findProjectName("Projet sans titre");

    await app.switchLanguage("en");
    await app.page.reload();
    // French URL ignored as we've made an explicit language choice.
    await app.findProjectName("Untitled project");
  });

  test("switches language", async ({ app }) => {
    await app.goto();
    await app.switchLanguage("fr");
    await app.findProjectName("Projet sans titre");
    await app.switchLanguage("en");
    await app.findProjectName("Untitled project");
  });
});
