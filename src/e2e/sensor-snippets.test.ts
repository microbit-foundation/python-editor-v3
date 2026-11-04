/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures";
import { App } from "./app";

test.use({ viewport: { width: 1600, height: 1000 } });

const startDrag = async (app: App, name: string, line: number) => {
  const source = app.page
    .getByRole("listitem")
    .filter({ hasText: name })
    .locator('[draggable="true"]')
    .first();
  const dataTransfer = await app.page.evaluateHandle(() => new DataTransfer());
  await source.dispatchEvent("dragstart", { dataTransfer });
  const bounds = (await app.editorTextArea
    .locator(".cm-line")
    .nth(line - 1)
    .boundingBox())!;
  const position = {
    clientX: bounds.x + 20,
    clientY: bounds.y + bounds.height / 2,
  };
  await app.editorTextArea.dispatchEvent("dragover", {
    dataTransfer,
    ...position,
  });
  return {
    cancel: async () => {
      await app.editorTextArea.dispatchEvent("dragleave", { dataTransfer });
      await source.dispatchEvent("dragend", { dataTransfer });
      await dataTransfer.dispose();
    },
    drop: async () => {
      await app.editorTextArea.dispatchEvent("drop", {
        dataTransfer,
        ...position,
      });
      await source.dispatchEvent("dragend", { dataTransfer });
      await dataTransfer.dispose();
    },
  };
};

test("combines a dragged sensor initialization and preserves undo/redo", async ({
  app,
}) => {
  await app.page.goto(
    `${app.baseUrl}/sensoren/bme680?l=en&flag=none&flag=noWelcome`
  );
  const original =
    "import board\nbus = board.I2C()\n\nwhile True:\n    print(1)\n";
  await app.editorTextArea.fill(original);
  const preview = await startDrag(app, "Initialise BME680", 5);
  await expect(app.page.locator(".cm-preview").first()).toBeVisible();
  await preview.cancel();
  await expect(app.editorTextArea).not.toContainText("Adafruit_BME680_I2C");

  const drag = await startDrag(app, "Initialise BME680", 5);
  await drag.drop();
  const result = await app.editorTextArea.innerText();
  expect(result.match(/board\.I2C\(\)/g)).toHaveLength(1);
  expect(result).toContain(
    "bme680 = adafruit_bme680.Adafruit_BME680_I2C(bus, address=0x76)"
  );
  expect(result.indexOf("bme680 =")).toBeLessThan(
    result.indexOf("while True:")
  );
  await app.page.keyboard.press(`${app.modifierKey}+z`);
  await expect(app.editorTextArea).not.toContainText("Adafruit_BME680_I2C");
  await expect(app.editorTextArea).toContainText("bus = board.I2C()");
  await app.page.getByRole("button", { name: "Redo", exact: true }).click();
  await expect(app.editorTextArea).toContainText(
    "Adafruit_BME680_I2C(bus, address=0x76)"
  );
});

test("combines a copied sensor block through the clipboard path", async ({
  app,
}) => {
  await app.page.goto(
    `${app.baseUrl}/sensoren/helligkeit_uv?l=en&flag=none&flag=noWelcome`
  );
  await app.editorTextArea.fill(
    "import board\nbus = board.I2C()\n\nwhile True:\n    pass\n"
  );
  await app.copyCode("Initialise UV sensor");
  await app.editorTextArea.click();
  await app.page.keyboard.press(`${app.modifierKey}+End`);
  await app.pasteInEditor();
  await expect(app.editorTextArea).toContainText("uv = VEML6070(bus)");
  const result = await app.editorTextArea.innerText();
  expect(result.match(/board\.I2C\(\)/g)).toHaveLength(1);
  expect(result.indexOf("uv =")).toBeLessThan(result.indexOf("while True:"));
});

test("explains a missing initialization and opens its sensor block", async ({
  app,
}) => {
  await app.page.goto(
    `${app.baseUrl}/sensoren/bme680?l=en&flag=none&flag=noWelcome`
  );
  await app.editorTextArea.fill("print(bme680.temperature)\n");
  const marker = app.editorTextArea
    .locator(".cm-lintRange-error")
    .filter({ hasText: "bme680" });
  await marker.hover();
  await expect(
    app.page.getByText(
      "Initialize bme680 first using the “Initialise BME680” block under Sensors.",
      { exact: true }
    )
  ).toBeVisible();
  await app.page
    .getByRole("button", { name: "Show initialization block" })
    .click();
  await expect(app.page).toHaveURL(/\/sensoren\/bme680-initialisieren/);

  const drag = await startDrag(app, "Initialise BME680", 1);
  await drag.drop();
  await expect(app.editorTextArea).toContainText(
    "bme680 = adafruit_bme680.Adafruit_BME680_I2C(i2c, address=0x76)"
  );
  await expect(marker).toHaveCount(0);
});
