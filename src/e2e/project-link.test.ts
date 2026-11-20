/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";
import {
  heartProjectLinkFragment,
  sunlightSensorProjectLinkFragment,
} from "./project-links.js";

test.describe("project link", () => {
  test("Loads the project from the URL", async ({ app, homePage }) => {
    await app.goto({ fragment: heartProjectLinkFragment });
    await app.page.reload();
    await app.expectProjectName("Hearts");
    await app.expectEditorContainText(
      "from microbit import *display.show(Image.HEART)"
    );

    // Regression test: Check that we can open a different project link in the same session.
    // Previously we ignored the link because we already had content in session storage.
    await app.goto({
      fragment: sunlightSensorProjectLinkFragment,
    });
    await app.page.reload();
    // wait for page to load
    await app.saveButton.waitFor();
    await app.expectEditorContainText("display.read_light_level");

    // Each link made a project rather than replacing the last.
    await app.goHome();
    await homePage.cards.expectVisible("Hearts");
  });
});
