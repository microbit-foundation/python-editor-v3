/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { vi } from "vitest";
import { Text } from "@codemirror/state";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import * as LSP from "vscode-languageserver-protocol";
import { Action } from "../lint/lint";
import { diagnosticsMapping } from "./diagnostics";
import { createIntl } from "react-intl";
import english from "../../../../lang/ui.en.json";
import german from "../../../../lang/ui.de.json";

const createDevice = (
  status: ConnectionStatus,
  boardVersion: string | undefined
): MicrobitUSBConnection =>
  ({
    status,
    getBoardVersion: () => boardVersion,
  } as unknown as MicrobitUSBConnection);

const v1Device = createDevice(ConnectionStatus.Connected, "V1");
const v2Device = createDevice(ConnectionStatus.Connected, "V2");
const disconnectedDevice = createDevice(
  ConnectionStatus.Disconnected,
  undefined
);

const action: Action = {
  name: "Test action",
  apply: () => {},
};

const lspDiagnostic = (
  overrides: Partial<LSP.Diagnostic> = {}
): LSP.Diagnostic => ({
  range: {
    start: { line: 0, character: 0 },
    end: { line: 0, character: 4 },
  },
  message: "Oops",
  ...overrides,
});

const document = Text.of(["pass", "pass"]);

const map = (
  diagnostics: LSP.Diagnostic[],
  device: MicrobitUSBConnection = disconnectedDevice,
  warnOnV2OnlyFeatures: boolean = true,
  source: Text = document
) =>
  diagnosticsMapping(
    source,
    diagnostics,
    device,
    warnOnV2OnlyFeatures,
    () => action
  );

describe("diagnosticsMapping", () => {
  it.each([
    ["en", english],
    ["de", german],
  ] as const)(
    "explains missing sensor initialization in %s and links to the block",
    (locale, catalog) => {
      const intl = createIntl({
        locale,
        messages: Object.fromEntries(
          Object.entries(catalog).map(([id, message]) => [
            id,
            message.defaultMessage,
          ])
        ),
      });
      const diagnostics = diagnosticsMapping(
        Text.of(["print(bme680.temperature)"]),
        [
          lspDiagnostic({
            code: "reportUndefinedVariable",
            severity: LSP.DiagnosticSeverity.Error,
            range: {
              start: { line: 0, character: 6 },
              end: { line: 0, character: 12 },
            },
          }),
        ],
        disconnectedDevice,
        true,
        () => action,
        intl
      );
      expect(diagnostics[0].message).toBe(
        intl.formatMessage(
          { id: "sensor-initialization-missing" },
          {
            variable: "bme680",
            block:
              locale === "de" ? "BME680 initialisieren" : "Initialise BME680",
          }
        )
      );
      expect(diagnostics[0].severity).toBe("error");
      const listener = vi.fn();
      window.document.addEventListener("cm/openDocs", listener);
      try {
        diagnostics[0].actions![0].apply({} as never, 6, 12);
        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener.mock.calls[0][0].detail).toEqual({
          tab: "sensoren",
          id: "bme680-initialisieren",
        });
      } finally {
        window.document.removeEventListener("cm/openDocs", listener);
      }
    }
  );

  it("keeps unrelated diagnostics unchanged", () => {
    const intl = createIntl({ locale: "en", messages: {} });
    for (const [source, code] of [
      ["bme680.temperature", "reportAttributeAccessIssue"],
      ["value.temperature", "reportUndefinedVariable"],
      ["bme680 = 1", "reportUndefinedVariable"],
    ]) {
      const result = diagnosticsMapping(
        Text.of([source]),
        [
          lspDiagnostic({
            code,
            range: {
              start: { line: 0, character: 0 },
              end: { line: 0, character: source.startsWith("value") ? 5 : 6 },
            },
          }),
        ],
        disconnectedDevice,
        true,
        () => action,
        intl
      );
      expect(result[0]).toMatchObject({ message: "Oops", actions: [] });
    }
  });

  it("maps position, message and severity", () => {
    expect(
      map([lspDiagnostic({ severity: LSP.DiagnosticSeverity.Error })])
    ).toEqual([
      {
        from: 0,
        to: 4,
        severity: "error",
        message: "Oops",
        tags: undefined,
        actions: [],
      },
    ]);
  });

  it("maps each severity", () => {
    const severities = map([
      lspDiagnostic({ severity: LSP.DiagnosticSeverity.Error }),
      lspDiagnostic({ severity: LSP.DiagnosticSeverity.Warning }),
      lspDiagnostic({ severity: LSP.DiagnosticSeverity.Information }),
      lspDiagnostic({ severity: LSP.DiagnosticSeverity.Hint }),
    ]).map((d) => d.severity);
    expect(severities).toEqual(["error", "warning", "info", "hint"]);
  });

  it("defaults missing severity to warning", () => {
    expect(map([lspDiagnostic()])[0].severity).toEqual("warning");
  });

  it("maps positions on later lines", () => {
    const diagnostic = lspDiagnostic({
      range: {
        start: { line: 1, character: 0 },
        end: { line: 1, character: 4 },
      },
    });
    expect(map([diagnostic])[0]).toMatchObject({ from: 5, to: 9 });
  });

  it("converts tags", () => {
    const diagnostic = lspDiagnostic({
      tags: [LSP.DiagnosticTag.Unnecessary, LSP.DiagnosticTag.Deprecated],
    });
    expect(map([diagnostic])[0].tags).toEqual(["unnecessary", "deprecated"]);
  });

  it("skips diagnostics that don't map to the document", () => {
    const diagnostic = lspDiagnostic({
      range: {
        start: { line: 10, character: 0 },
        end: { line: 10, character: 4 },
      },
    });
    expect(map([diagnostic])).toEqual([]);
  });

  it("suppresses missing imports for CircuitPython modules", () => {
    const source = Text.of([
      "import busio",
      "import microcontroller",
      "import adafruit_icm20x",
    ]);
    const missingImport = (line: number) =>
      lspDiagnostic({
        code: "reportMissingImports",
        range: {
          start: { line, character: 7 },
          end: { line, character: source.line(line + 1).length },
        },
      });

    expect(
      map(
        [missingImport(0), missingImport(1), missingImport(2)],
        undefined,
        true,
        source
      )
    ).toEqual([]);
  });

  it("keeps missing imports for unknown modules", () => {
    const source = Text.of(["import not_a_real_module"]);
    expect(
      map(
        [
          lspDiagnostic({
            code: "reportMissingImports",
            range: {
              start: { line: 0, character: 7 },
              end: { line: 0, character: 24 },
            },
          }),
        ],
        undefined,
        true,
        source
      )
    ).toHaveLength(1);
  });

  it.each(["monotonic", "struct_time", "mktime"])(
    "keeps genuine CircuitPython time.%s diagnostics visible",
    (functionName) => {
      const source = Text.of([`start = time.${functionName}()`]);
      expect(
        map(
          [
            lspDiagnostic({
              code: "reportAttributeAccessIssue",
              range: {
                start: { line: 0, character: 8 },
                end: { line: 0, character: source.line(1).length },
              },
            }),
          ],
          undefined,
          true,
          source
        )
      ).toHaveLength(1);
    }
  );

  it.each(["brightness", "pixel_order", "auto_write", "GRB"])(
    "keeps genuine CircuitPython NeoPixel diagnostics for %s",
    (name) => {
      const source = Text.of([
        "pixels = neopixel.NeoPixel(",
        `    board.D2, ${name}=value`,
        ")",
      ]);
      const line = source.line(2);
      const from = line.from + line.text.indexOf(name);
      expect(
        map(
          [
            lspDiagnostic({
              code: "reportCallIssue",
              range: {
                start: { line: 1, character: line.text.indexOf(name) },
                end: {
                  line: 1,
                  character: line.text.indexOf(name) + name.length,
                },
              },
            }),
          ],
          undefined,
          true,
          source
        )
      ).toHaveLength(1);
      expect(from).toBeGreaterThan(0);
    }
  );

  describe("micro:bit V2-only API warnings", () => {
    const v2OnlyDiagnostic = lspDiagnostic({
      code: "reportMicrobitVersionApiUnsupported",
    });

    it("shown with action when a V1 board is connected", () => {
      const result = map([v2OnlyDiagnostic], v1Device);
      expect(result).toHaveLength(1);
      expect(result[0].actions).toEqual([action]);
    });

    it("suppressed when the setting is off", () => {
      expect(map([v2OnlyDiagnostic], v1Device, false)).toEqual([]);
    });

    it("suppressed when a V2 board is connected", () => {
      expect(map([v2OnlyDiagnostic], v2Device)).toEqual([]);
    });

    it("suppressed when no board is connected", () => {
      expect(map([v2OnlyDiagnostic], disconnectedDevice)).toEqual([]);
    });
  });
});
