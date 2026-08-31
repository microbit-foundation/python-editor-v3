/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@codemirror/state";
import { ConnectionStatus } from "@microbit/microbit-connection";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import * as LSP from "vscode-languageserver-protocol";
import { Action } from "../lint/lint";
import { diagnosticsMapping } from "./diagnostics";

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
  warnOnV2OnlyFeatures: boolean = true
) =>
  diagnosticsMapping(
    document,
    diagnostics,
    device,
    warnOnV2OnlyFeatures,
    () => action
  );

describe("diagnosticsMapping", () => {
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
