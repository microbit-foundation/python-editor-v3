/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - settings", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("switches language", async () => {
    // NOTE: the app methods generally won't still work after changing language.
    await app.switchLanguage("fr");
    await app.findProjectName("Projet sans titre");
    await app.switchLanguage("en");
    await app.findProjectName("Untitled project");
  });
});
