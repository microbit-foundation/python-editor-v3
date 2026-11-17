/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures.js";

test.describe("language server start-up", () => {
  // A service worker would serve the script from its precache, out of
  // reach of the route below.
  test.use({ serviceWorkers: "block" });

  let requests: number;

  test.beforeEach(async ({ context }) => {
    requests = 0;
    await context.route(/pyright-locale-/, (route) =>
      ++requests <= 2 ? route.abort("failed") : route.continue()
    );
  });

  test("recovers when its language script fails to load", async ({ app }) => {
    await expect.poll(() => requests).toBeGreaterThan(2);

    await app.selectAllInEditor();
    await app.typeInEditor("from microbit import *\ndisplay.s");
    await app.expectCompletionOptions(["scroll", "set_pixel", "show"]);
  });
});
