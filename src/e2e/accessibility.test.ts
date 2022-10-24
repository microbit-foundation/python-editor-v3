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
    app.assertFocusOnLoad();
  });

  it("focuses the correct elements on collapsing and expanding the simulator", async () => {
    await app.collapseSimulator();
    await app.assertFocusOnExpandSimulator();

    await app.expandSimulator();
    await app.assertFocusOnSimulator();
  });

  it("focuses the correct elements on collapsing and expanding the sidebar", async () => {
    await app.collapseSidebar();
    await app.assertFocusOnExpandSidebar();

    await app.expandSidebar();
    await app.assertFocusOnSidebar();
  });

  it("allows tab out of editor", async () => {
    await app.typeInEditor("Hello");
    await app.tabOutOfEditorForwards();
    await app.assertFocusAfterEditor();

    await app.typeInEditor("World");
    await app.tabOutOfEditorBackwards();
    await app.assertFocusBeforeEditor();
  });
});
