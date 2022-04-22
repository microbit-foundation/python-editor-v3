/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - settings", () => {
  const app = new App();
  beforeEach(() => {
    app.setOptions({});
    return app.reset();
  });
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("sets language via URL", async () => {
    app.setOptions({
      language: "fr",
    });
    await app.reset();
    // French via the URL
    await app.findProjectName("Projet sans titre");

    await app.switchLanguage("en");
    await app.reset();
    // French URL ignored as we've made an explicit language choice.
    await app.findProjectName("Untitled project");
  });

  it("switches language", async () => {
    // NOTE: the app methods generally won't still work after changing language.
    await app.switchLanguage("fr");
    await app.findProjectName("Projet sans titre");
    await app.switchLanguage("en");
    await app.findProjectName("Untitled project");
  });
});
