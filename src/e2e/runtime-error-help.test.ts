/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { expect } from "@playwright/test";
import { test } from "./app-test-fixtures";
import { App } from "./app";

test.use({ viewport: { width: 1600, height: 1000 } });

const prepare = async (app: App, language = "en") => {
  await app.goto({ language, flags: ["noLang"] });
  await app.editorTextArea.fill("print(1)\nprint(2)\nprint(3)\n");
  await app.page.evaluate(async () => (window as any).mockDevice.connect());
  await expect(
    app.page.getByRole("button", {
      name: language === "de" ? "Konsole leeren" : "Clear console",
    })
  ).toBeVisible();
  await app.page.evaluate(() =>
    (window as any).mockDevice.dispatchEvent("flash")
  );
};

const emit = async (
  app: App,
  error: string,
  file = "code.py",
  library = false
) => {
  const trace = `Traceback (most recent call last):\r\n  File "${file}", line 3, in <module>\r\n${
    library
      ? '  File "/lib/adafruit_bme680.mpy", line 99, in temperature\r\n'
      : ""
  }${error}\r\n`;
  await app.page.evaluate(
    (data) => (window as any).mockDevice.mockSerialWrite(data),
    trace
  );
};

test("explains an I2C error in German and opens the project caller with editor focus", async ({
  app,
}, testInfo) => {
  await prepare(app, "de");
  await emit(
    app,
    "ValueError: No I2C device at address: 0x76",
    "code.py",
    true
  );
  await app.page
    .getByRole("button", { name: "Fehler erklären", exact: true })
    .click();
  const dialog = app.page.getByRole("dialog", {
    name: "Diesen Fehler verstehen",
  });
  await expect(dialog).toContainText(
    "Die Meldung weist auf ein Problem beim Erreichen eines I²C-Geräts"
  );
  await expect(dialog).toContainText(
    "Prüfe das Kabel und die SDA-/SCL-Anschlüsse"
  );
  await expect(dialog).toContainText(
    "ValueError: No I2C device at address: 0x76"
  );
  await dialog.screenshot({
    path: testInfo.outputPath("runtime-error-help-de.png"),
  });
  await dialog.getByRole("button", { name: "code.py, Zeile 3 öffnen" }).click();
  await expect(dialog).toBeHidden();
  await expect(app.editorTextArea).toBeFocused();
  await expect
    .poll(() =>
      app.page.evaluate(
        () =>
          window.getSelection()?.anchorNode?.parentElement?.closest(".cm-line")
            ?.textContent
      )
    )
    .toBe("print(3)");
});

test("preserves the explanation after editing and avoids a stale line jump", async ({
  app,
}) => {
  await prepare(app);
  await emit(app, "NameError: name 'sensor' is not defined");
  await app.editorTextArea.fill("print('changed')\n");
  await app.page
    .getByRole("button", { name: "Explain error", exact: true })
    .click();
  const dialog = app.page.getByRole("dialog", {
    name: "Understand this error",
  });
  await expect(dialog).toContainText("A name has no value at this point");
  await expect(dialog).toContainText(
    "The project has changed or has not been transferred"
  );
  await expect(
    dialog.getByRole("button", { name: /Open code.py/ })
  ).toHaveCount(0);
  await dialog.getByRole("button", { name: "Close", exact: true }).click();
  await expect(
    app.page.getByRole("button", { name: "Explain error", exact: true })
  ).toBeFocused();
});

test("does not turn an ambiguous OSError into a sensor diagnosis", async ({
  app,
}) => {
  await prepare(app);
  await emit(
    app,
    "OSError: [Errno 5] Input/output error",
    "/lib/storage_helper.py"
  );
  await app.page
    .getByRole("button", { name: "Explain error", exact: true })
    .click();
  const dialog = app.page.getByRole("dialog", {
    name: "Understand this error",
  });
  await expect(dialog).toContainText(
    "this message alone does not prove a sensor fault"
  );
  await expect(dialog).toContainText("no matching file in your project");
  await expect(dialog.getByRole("button", { name: /Open .*line/ })).toHaveCount(
    0
  );
  await expect(dialog).toContainText("OSError: [Errno 5] Input/output error");
});

test("offers a fallback and clears the dialog on serial reset", async ({
  app,
}) => {
  await prepare(app);
  await emit(app, "CustomError: unexpected result");
  await app.page
    .getByRole("button", { name: "Explain error", exact: true })
    .click();
  await expect(app.page.getByRole("dialog")).toContainText(
    "There is no specific explanation for this message yet"
  );
  await app.page.evaluate(() =>
    (window as any).mockDevice.dispatchEvent("serialreset")
  );
  await expect(app.page.getByRole("dialog")).toHaveCount(0);
  await expect(
    app.page.getByRole("button", { name: "Explain error", exact: true })
  ).toHaveCount(0);
  await emit(app, "CustomError: unexpected result");
  await expect(
    app.page.getByRole("button", { name: "Explain error", exact: true })
  ).toBeVisible();
  await expect(app.page.getByRole("dialog")).toHaveCount(0);
});
