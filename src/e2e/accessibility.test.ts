/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

describe("Browser - accessibility", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("focuses the correct element on tabbing after load", async () => {
    expect(await app.assertFocusOnLoad()).toBe(true);
  });

  it("focuses the correct elements on collapsing and expanding the sidebar", async () => {
    expect(await app.assertFocusOnAreaToggle("Collapse", "simulator")).toBe(
      true
    );
    expect(await app.assertFocusOnAreaToggle("Expand", "simulator")).toBe(true);
  });

  it("focuses the correct elements on collapsing and expanding the simulator", async () => {
    expect(await app.assertFocusOnAreaToggle("Collapse", "sidebar")).toBe(true);
    expect(await app.assertFocusOnAreaToggle("Expand", "sidebar")).toBe(true);
  });
});
