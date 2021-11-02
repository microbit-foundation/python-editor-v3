/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App, defaultRootUrl } from "./app";

describe("Browser - toolkit tabs", () => {
  // Enable flags to allow testing the toolkit interactions.
  const app = new App(defaultRootUrl + "?flag=*");
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("Advanced toolkit navigation", async () => {
    await app.switchTab("Advanced");
    await app.findToolkitTopLevelHeading(
      "Advanced",
      "Reference documentation for micro:bit MicroPython"
    );
  });

  // When we have firmer content for the other toolkits we'll add navigation here.
});
