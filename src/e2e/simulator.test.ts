/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test } from "./app-test-fixtures.js";

const basicTest = `from microbit import *
display.show(Image.NO)`;

const buttonTest = `from microbit import *
while True:
    if button_a.was_pressed():
        display.show(Image.NO)`;

const gestureTest = `from microbit import *
while True:
    if accelerometer.was_gesture('freefall'):
        display.show(Image.NO)`;

const sliderTest = `from microbit import *
while True:
    if temperature() == -5:
        display.show(Image.NO)`;

test.describe("simulator", () => {
  test("responds to a sent gesture", async ({ app }) => {
    // Enum sensor change via select and button.
    await app.selectAllInEditor();
    await app.typeInEditor(gestureTest);
    await app.simulator.run();
    await app.simulator.simulatorSelectGesture("freefall");
    await app.simulator.sendGestureButton.click();
    await app.simulator.expectResponse();
  });

  test("responds to a range sensor change", async ({ app }) => {
    // Range sensor change via slider.
    await app.selectAllInEditor();
    await app.typeInEditor(sliderTest);
    await app.simulator.run();
    await app.simulator.setRangeSlider("Temperature", "min");
    await app.simulator.expectResponse();
  });

  test("responds to a button press", async ({ app }) => {
    // Range sensor change via button.
    await app.selectAllInEditor();
    await app.typeInEditor(buttonTest);
    await app.simulator.run();
    await app.simulator.inputPressHold("Press button A", 500);
    await app.simulator.expectResponse();
  });
  test("stops when the code changes", async ({ app }) => {
    await app.selectAllInEditor();
    await app.typeInEditor(basicTest);
    await app.simulator.run();
    await app.simulator.expectResponse();

    await app.typeInEditor("A change!");

    await app.simulator.expectStopped();
  });
});
