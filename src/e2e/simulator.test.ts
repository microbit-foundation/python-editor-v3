/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { App } from "./app";

const basicTest = "from microbit import *\ndisplay.show(Image.NO)";

const buttonTest =
  "from microbit import *\nwhile True:\nif button_a.was_pressed():\ndisplay.show(Image.NO)";

const gestureTest =
  "from microbit import *\nwhile True:\nif accelerometer.was_gesture('freefall'):\ndisplay.show(Image.NO)";

const sliderTest =
  "from microbit import *\nwhile True:\nif temperature() == -5:\ndisplay.show(Image.NO)";

describe("Browser - simulator", () => {
  const app = new App();
  beforeEach(app.reset.bind(app));
  afterEach(app.screenshot.bind(app));
  afterAll(app.dispose.bind(app));

  it("responds to a sent gesture", async () => {
    // Enum sensor change via select and button.
    await app.selectAllInEditor();
    await app.typeInEditor(gestureTest);
    await app.runSimulator();
    await app.simulatorSelectGesture("freefall");
    await app.simulatorSendGesture();
    await app.simulatorConfirmResponse();
  });

  it("responds to a range sensor change", async () => {
    // Range sensor change via slider.
    await app.selectAllInEditor();
    await app.typeInEditor(sliderTest);
    await app.runSimulator();
    await app.simulatorSetRangeSlider("Temperature", "min");
    await app.simulatorConfirmResponse();
  });

  it("responds to a button press", async () => {
    // Range sensor change via button.
    await app.selectAllInEditor();
    await app.typeInEditor(buttonTest);
    await app.runSimulator();
    await app.simulatorInputPressHold("Press button A", 500);
    await app.simulatorConfirmResponse();
  });
  it("stops when the code changes", async () => {
    await app.selectAllInEditor();
    await app.typeInEditor(basicTest);
    await app.runSimulator();
    await app.simulatorConfirmResponse();

    await app.typeInEditor("A change!");

    await app.findStoppedSimulator();
  });
});
