/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { test, expect } from "@playwright/test";

// Includes loading the editor and language server on cold dev-server starts.
test.setTimeout(90000);

const replaceEditorCode = async (
  page: import("@playwright/test").Page,
  code: string
) => {
  const editor = page.getByTestId("editor").getByRole("textbox");
  await editor.click();
  await page.keyboard.press("Control+A");
  await page.keyboard.insertText(code);
};

declare global {
  interface Window {
    senseboxTest: {
      commands: string[];
      written: Record<string, string>;
      bytes: Record<string, number[]>;
      folderSelections: number;
      connections: number;
      validFolder: boolean;
      failWrite: boolean;
      readOnly: boolean;
      restarts: number;
      startFailure: boolean;
      writes: number;
      hostFlushes: number;
      directoryName: string;
      pauseVerification: boolean;
      releaseVerification?: () => void;
    };
  }
}

// Exercise the production device implementation, substituting only browser USB APIs.
test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: "MBCC",
      value: encodeURIComponent(
        JSON.stringify({ version: 1, analytics: false, functional: true })
      ),
      url: `http://localhost:${process.env.E2E_PORT ?? "3000"}`,
    },
  ]);
  await page.addInitScript(() => {
    const state: Window["senseboxTest"] = {
      commands: [],
      written: {},
      bytes: {},
      folderSelections: 0,
      connections: 0,
      validFolder: true,
      failWrite: false,
      readOnly: false,
      restarts: 0,
      startFailure: false,
      writes: 0,
      hostFlushes: 0,
      directoryName: "CIRCUITPY",
      pauseVerification: false,
    };
    window.senseboxTest = state;
    Object.defineProperty(navigator, "serial", {
      value: {
        requestPort: async () => {
          state.connections++;
          let controller: ReadableStreamDefaultController<Uint8Array>;
          let raw = false;
          return {
            open: async () => {},
            close: async () => {},
            readable: new ReadableStream<Uint8Array>({
              start(c) {
                controller = c;
              },
            }),
            writable: new WritableStream<Uint8Array>({
              write(bytes) {
                const command = new TextDecoder().decode(bytes);
                state.commands.push(command);
                if (command === "\x03\x03\x02" || command === "\x03\x02") {
                  raw = false;
                  controller.enqueue(new TextEncoder().encode("\r\n>>> "));
                } else if (command === "\x03") {
                  controller.enqueue(new TextEncoder().encode("\r\n>>> "));
                } else if (command === "\x01") {
                  raw = true;
                  controller.enqueue(
                    new TextEncoder().encode("raw REPL; CTRL-B to exit\r\n>")
                  );
                } else if (command === "\x04") {
                  if (raw) {
                    const respond = () =>
                      controller.enqueue(
                        new TextEncoder().encode("OK1\r\n\x04\x04>")
                      );
                    if (state.pauseVerification)
                      state.releaseVerification = respond;
                    else respond();
                  } else {
                    state.restarts++;
                    controller.enqueue(
                      new TextEncoder().encode(
                        state.startFailure
                          ? "weicher reboot\r\ncode.py Ausgabe:\r\nOSError: [Errno 5] Eingabe-/Ausgabefehler\r\n"
                          : "soft reboot\r\ncode.py output:\r\nPROGRAM STARTED\r\n"
                      )
                    );
                  }
                }
              },
            }),
          };
        },
      },
    });
    window.showDirectoryPicker = async () => {
      state.folderSelections++;
      const directory = (prefix = ""): FileSystemDirectoryHandle =>
        ({
          kind: "directory",
          name: prefix ? prefix.split("/").slice(-2)[0] : state.directoryName,
          getDirectoryHandle: async (name: string) =>
            directory(prefix + name + "/"),
          getFileHandle: async (
            leaf: string,
            options?: { create?: boolean }
          ) => {
            const name = prefix + leaf;
            if (name === "boot_out.txt") {
              if (!state.validFolder)
                throw new DOMException("Missing", "NotFoundError");
              return {
                getFile: async () =>
                  new File(["Adafruit CircuitPython 10.3.0"], name),
              };
            }
            if (!state.bytes[name]) {
              if (!options?.create)
                throw new DOMException("Missing", "NotFoundError");
              state.bytes[name] = [];
            }
            return {
              getFile: async () =>
                new File([new Uint8Array(state.bytes[name])], name),
              createWritable: async () => {
                if (state.readOnly)
                  throw new DOMException(
                    "An attempt was made to write to a file or directory which could not be modified due to the state of the underlying filesystem.",
                    "NoModificationAllowedError"
                  );
                return {
                  write: async (bytes: Uint8Array) => {
                    if (state.failWrite)
                      throw new DOMException("Device removed", "NotFoundError");
                    state.writes++;
                    state.bytes[name] = Array.from(bytes);
                    state.written[name] = new TextDecoder().decode(bytes);
                  },
                  close: async () => {},
                  abort: async () => {},
                };
              },
            };
          },
        } as unknown as FileSystemDirectoryHandle);
      return directory();
    };
  });
  await page.route("**/__sensebox__/flush", async (route) => {
    const request = route.request();
    expect(request.headers()["origin"]).toBe(new URL(request.url()).origin);
    expect(request.postDataJSON()).toMatchObject({
      directoryName: "CIRCUITPY",
      bootOut: "Adafruit CircuitPython 10.3.0",
    });
    await page.evaluate(() => window.senseboxTest.hostFlushes++);
    await route.fulfill({ status: 204 });
  });
  await page.goto(`http://localhost:${process.env.E2E_PORT ?? "3000"}/?l=de`);
  await expect(page.getByTestId("editor").getByRole("textbox")).toBeVisible({
    timeout: 60000,
  });
});

test("connects without writing and transfers the latest code only from the lower button", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Trennen", exact: true })
  ).toBeVisible();
  expect(await page.evaluate(() => window.senseboxTest)).toMatchObject({
    connections: 1,
    written: {},
    folderSelections: 0,
  });
  await page
    .getByRole("button", { name: "Serielle Schnittstelle anzeigen" })
    .click();
  await page
    .getByTestId("serial-output")
    .locator("textarea")
    .press("Control+c");
  await expect
    .poll(() =>
      page.evaluate(() => window.senseboxTest.commands.includes("\x03"))
    )
    .toBe(true);
  await replaceEditorCode(page, 'print("transfer-test")');
  const transfer = page.getByRole("button", {
    name: "Code übertragen",
    exact: true,
  });
  await expect(transfer).not.toBeVisible();
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await expect(transfer).toBeVisible();
  await expect(transfer).toBeEnabled();
  await transfer.click();
  await expect(page.getByRole("dialog")).toContainText("Code wird übertragen");
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.written["code.py"]))
    .toBe('print("transfer-test")');
  await expect(
    page.getByRole("button", { name: "Code übertragen", exact: true })
  ).toBeEnabled();
  const firstWrites = await page.evaluate(() => window.senseboxTest.writes);
  expect(await page.evaluate(() => window.senseboxTest.hostFlushes)).toBe(
    process.env.CI ? 0 : 1
  );
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.restarts))
    .toBe(2);
  expect(await page.evaluate(() => window.senseboxTest.writes)).toBe(
    firstWrites
  );
  expect(await page.evaluate(() => window.senseboxTest.hostFlushes)).toBe(
    process.env.CI ? 0 : 2
  );
  await expect(page.getByTestId("serial-output")).toContainText(
    "PROGRAM STARTED"
  );
  expect(await page.evaluate(() => window.senseboxTest.folderSelections)).toBe(
    1
  );
});

test("shows MCU verification as an unfinished phase and starts only after acknowledgement", async ({
  page,
}, testInfo) => {
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page.evaluate(() => {
    window.senseboxTest.pauseVerification = true;
  });
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  const dialog = page.getByRole("dialog", { name: "Code wird übertragen" });
  await expect(dialog.locator('[aria-current="step"]')).toContainText(
    "Dateien auf der senseBox prüfen"
  );
  await expect(dialog).toContainText("Das kann bis zu 60 Sekunden dauern");
  await expect(dialog.getByRole("progressbar")).toHaveCount(0);
  await expect(
    dialog.getByRole("status", { name: "Dateien auf der senseBox prüfen" })
  ).toBeVisible();
  expect(await page.evaluate(() => window.senseboxTest.restarts)).toBe(0);
  await dialog.screenshot({
    path: testInfo.outputPath("transfer-verification.png"),
  });
  await page.evaluate(() => {
    window.senseboxTest.pauseVerification = false;
    window.senseboxTest.releaseVerification?.();
  });
  await expect(dialog.locator('[aria-current="step"]')).toContainText(
    "Programm starten"
  );
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => window.senseboxTest.restarts)).toBe(1);
});

test("accepts a Windows drive-root display name and enables the separate transfer button", async ({
  page,
}) => {
  await page.evaluate(() => {
    window.senseboxTest.directoryName = "CIRCUITPY (D:)";
  });
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  const select = page.getByRole("button", {
    name: "CIRCUITPY-Verzeichnis auswählen",
  });
  const transfer = page.getByRole("button", {
    name: "Code übertragen",
    exact: true,
  });
  await expect(transfer).toBeDisabled();
  await select.click();
  await expect(select).toBeVisible();
  await expect(transfer).toBeEnabled();
  await transfer.click();
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.restarts))
    .toBe(1);
  expect(await page.evaluate(() => window.senseboxTest.hostFlushes)).toBe(
    process.env.CI ? 0 : 1
  );
});

test("explains a wrong directory and reports write failure without a generic translation key", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect(
    page.getByText("Verbinde die senseBox zuerst", { exact: false })
  ).toBeVisible();
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page.evaluate(() => {
    window.senseboxTest.validFolder = false;
  });
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await expect(
    page.getByText(
      "Bitte wähle das Hauptverzeichnis des Laufwerks CIRCUITPY aus."
    )
  ).toBeVisible();
  expect(await page.evaluate(() => window.senseboxTest.written)).toEqual({});
  await page.evaluate(() => {
    window.senseboxTest.validFolder = true;
    window.senseboxTest.failWrite = true;
  });
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect(
    page.getByText(
      "Die Projektdateien konnten nicht vollständig geschrieben werden.",
      { exact: false }
    )
  ).toBeVisible();
  await expect(
    page.getByText("unexpected-error-description", { exact: true })
  ).toHaveCount(0);
  expect(await page.evaluate(() => window.senseboxTest.restarts)).toBe(0);
});

test("reports a read-only CIRCUITPY drive before writing and never requests a restart", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page.evaluate(() => {
    window.senseboxTest.readOnly = true;
  });
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect(
    page.getByText("Das Betriebssystem verweigert Änderungen an code.py.", {
      exact: false,
    })
  ).toBeVisible();
  await expect(
    page.getByText(
      "Ein erneutes Auswählen des Verzeichnisses allein behebt diesen Zustand nicht.",
      { exact: false }
    )
  ).toBeVisible();
  expect(await page.evaluate(() => window.senseboxTest.written)).toEqual({});
  expect(await page.evaluate(() => window.senseboxTest.restarts)).toBe(0);
});

test("reports the immediate post-reboot read error after saving instead of transfer success", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page.evaluate(() => {
    window.senseboxTest.startFailure = true;
  });
  await page
    .getByTestId("editor")
    .getByRole("textbox")
    .fill('print("load-error-test")');
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect(
    page.getByText("CircuitPython konnte code.py danach nicht lesen", {
      exact: false,
    })
  ).toBeVisible();
  expect(
    await page.evaluate(() => window.senseboxTest.written["code.py"])
  ).toBe('print("load-error-test")');
  expect(await page.evaluate(() => window.senseboxTest.restarts)).toBe(1);
  await expect(page.getByTestId("serial-output")).toContainText(
    "OSError: [Errno 5]"
  );
});

test("falls back to MCU verification when the optional local flush is unavailable", async ({
  page,
}) => {
  test.skip(
    !!process.env.CI,
    "The local flush helper is only used in development"
  );
  await page.route("**/__sensebox__/flush", (route) =>
    route.fulfill({ status: 503 })
  );
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page
    .getByTestId("editor")
    .getByRole("textbox")
    .fill('print("flush-fallback")');
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.restarts))
    .toBe(1);
  await expect(page.getByTestId("serial-output")).toContainText(
    "PROGRAM STARTED"
  );
  expect(
    await page.evaluate(() => window.senseboxTest.written["code.py"])
  ).toBe('print("flush-fallback")');
});

test("installs imported libraries, their dependencies and resources before code.py, skipping identical files", async ({
  page,
}) => {
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page
    .getByTestId("editor")
    .getByRole("textbox")
    .fill("import board\nimport adafruit_ssd1306\n");
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.restarts))
    .toBe(1);
  const state = await page.evaluate(() => window.senseboxTest);
  expect(state.bytes["lib/adafruit_ssd1306.mpy"].slice(0, 2)).toEqual([67, 6]);
  expect(state.bytes["lib/adafruit_bus_device/i2c_device.mpy"]).toBeDefined();
  expect(state.bytes["lib/adafruit_framebuf.mpy"]).toBeDefined();
  expect(state.bytes["font5x8.bin"]).toHaveLength(1282);
  expect(Object.keys(state.written).slice(-1)[0]).toBe("code.py");
  expect(state.written["code.py"]).toBe(
    "import board\nimport adafruit_ssd1306\n"
  );
  await expect(
    page.getByRole("button", { name: "Code übertragen", exact: true })
  ).toBeEnabled();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => window.senseboxTest.restarts))
    .toBe(2);
  expect(await page.evaluate(() => window.senseboxTest.writes)).toBe(
    state.writes
  );
});

test("reports a library download failure before changing the board or requesting a restart", async ({
  page,
}) => {
  await page.route("**/circuitpython/**/adafruit_pixelbuf.json", (route) =>
    route.fulfill({ status: 503 })
  );
  await page
    .getByRole("button", { name: "senseBox verbinden", exact: true })
    .click();
  await page
    .getByTestId("editor")
    .getByRole("textbox")
    .fill("import neopixel\n");
  await page
    .getByRole("button", { name: "CIRCUITPY-Verzeichnis auswählen" })
    .click();
  await page
    .getByRole("button", { name: "Code übertragen", exact: true })
    .click();
  await expect(
    page.getByText(
      "Die benötigte Bibliothek adafruit_pixelbuf konnte nicht vorbereitet werden.",
      { exact: false }
    )
  ).toBeVisible();
  expect(await page.evaluate(() => window.senseboxTest)).toMatchObject({
    writes: 0,
    restarts: 0,
  });
  expect(await page.evaluate(() => window.senseboxTest.commands)).not.toContain(
    "\x03\x03\x02"
  );
});
