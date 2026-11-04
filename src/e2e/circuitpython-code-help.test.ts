/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures";
import { App } from "./app";

test.use({ viewport: { width: 1600, height: 1000 } });
test.beforeEach(async ({ app }) => {
  await app.editorTextArea.fill("language_server_ready_marker\n");
  await expect(app.editorTextArea.locator(".cm-lintRange-error")).toBeVisible();
});
const complete = async (app: App, source: string) => {
  await app.editorTextArea.fill(source);
  await app.page.keyboard.press("End");
  await app.page.keyboard.type(".");
  const list = app.page.getByRole("listbox", { name: "Completions" });
  await expect(list).toBeVisible();
  return list;
};

test("completes senseBox pins and CircuitPython timing functions", async ({
  app,
}) => {
  let list = await complete(app, "import board\nboard");
  for (const name of ["IO_POWER", "PD_PIN", "PD_POWER", "I2C"])
    await expect(list.getByRole("option", { name, exact: true })).toBeVisible();
  await app.page.keyboard.press("Escape");
  list = await complete(app, "import time\ntime");
  await expect(
    list.getByRole("option", { name: "monotonic", exact: true })
  ).toBeVisible();
  await expect(
    list.getByRole("option", { name: "sleep_ms", exact: true })
  ).toHaveCount(0);
});

test("completes sensor properties and reports genuine attribute and argument errors", async ({
  app,
}) => {
  const setup =
    "import board\nimport busio\nimport adafruit_bme680\nsensor = adafruit_bme680.Adafruit_BME680_I2C(board.I2C())\n";
  const list = await complete(app, setup + "sensor");
  await expect(
    list.getByRole("option", { name: "temperature", exact: true })
  ).toBeVisible();
  await expect(
    list.getByRole("option", { name: "relative_humidity", exact: true })
  ).toBeVisible();
  await app.page.keyboard.press("Escape");
  await app.editorTextArea.fill(
    setup +
      'print(sensor.nonexistent_property)\nbusio.I2C(board.SCL, board.SDA, frequency="fast")\n'
  );
  await expect(
    app.editorTextArea
      .locator(".cm-lintRange-error")
      .filter({ hasText: "nonexistent_property" })
  ).toBeVisible();
  await expect(
    app.editorTextArea
      .locator(".cm-lintRange-error")
      .filter({ hasText: "fast" })
  ).toBeVisible();
});

test("uses a project-owned module ahead of the bundled driver types", async ({
  app,
}) => {
  await app.createNewFile("hdc1080.py");
  await app.editorTextArea.fill("project_value: int = 42\n");
  await app.editFile("code.py");
  const list = await complete(app, "import hdc1080\nhdc1080");
  await expect(
    list.getByRole("option", { name: "project_value", exact: true })
  ).toBeVisible();
  await expect(
    list.getByRole("option", { name: "HDC1080", exact: true })
  ).toHaveCount(0);
});

test("accepts the CircuitPython timing and NeoPixel keyword APIs without compatibility suppression", async ({
  app,
}) => {
  await app.editorTextArea.fill(
    "import board\nimport time\nimport neopixel\nstart = time.monotonic()\npixels = neopixel.NeoPixel(board.D1, 3, brightness=0.2, auto_write=True, pixel_order=neopixel.GRB)\nchecked_current_document\n"
  );
  const errors = app.editorTextArea.locator(".cm-lintRange-error");
  await expect(
    errors.filter({ hasText: "checked_current_document" })
  ).toBeVisible();
  await expect(errors).toHaveCount(1);
});
