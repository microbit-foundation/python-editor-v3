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
    await app.simulateTab();
    const activeElement = await app.getActiveElement();
    const firstFocusableElement = await app.getElementByRoleAndLabel(
      "link",
      "visit microbit.org (opens in a new tab)"
    );
    const equal = await app.compareElementHandles(
      activeElement,
      firstFocusableElement
    );
    expect(equal).toBe(true);
  });

  it("focuses the correct elements on collapsing and expanding the sidebar", async () => {
    await app.findAndClickButton("Collapse simulator");
    let activeElement = await app.getActiveElement();
    const expandSimulatorBtn = await app.getElementByRoleAndLabel(
      "button",
      "Expand simulator"
    );
    let equal = await app.compareElementHandles(
      activeElement,
      expandSimulatorBtn
    );
    expect(equal).toBe(true);

    await app.findAndClickButton("Expand simulator");
    activeElement = await app.getActiveElement();
    const simulatorIframe = await app.getElementByQuerySelector(
      "iframe[name='Simulator']"
    );
    equal = await app.compareElementHandles(activeElement, simulatorIframe);
    expect(equal).toBe(true);
  });

  it("focuses the correct elements on collapsing and expanding the simulator", async () => {
    await app.findAndClickButton("Collapse sidebar");
    let activeElement = await app.getActiveElement();
    const expandSidebarBtn = await app.getElementByRoleAndLabel(
      "button",
      "Expand sidebar"
    );
    let equal = await app.compareElementHandles(
      activeElement,
      expandSidebarBtn
    );
    expect(equal).toBe(true);

    await app.findAndClickButton("Expand sidebar");
    activeElement = await app.getActiveElement();
    // Should be the first tabpanel that is focused by default.
    const tabPanel = await app.getElementByQuerySelector("[role='tabpanel']");
    equal = await app.compareElementHandles(activeElement, tabPanel);
    expect(equal).toBe(true);
  });
});
