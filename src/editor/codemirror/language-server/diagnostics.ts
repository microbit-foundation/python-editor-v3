/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";
import { Action, Diagnostic } from "../lint/lint";
import { positionToOffset } from "./positions";
import { MicrobitUSBConnection } from "@microbit/microbit-connection/usb";
import { ConnectionStatus } from "@microbit/microbit-connection";
import circuitPythonLibraryCatalog from "../../../device/libraries/catalog.json";
import { IntlShape } from "react-intl";
import { missingSensorInitialization } from "../sensor-snippets";

const reportMicrobitVersionApiUnsupported =
  "reportMicrobitVersionApiUnsupported";

const circuitPythonBuiltinModules = new Set([
  "analogbufio",
  "analogio",
  "array",
  "audiobusio",
  "audiocore",
  "audiomixer",
  "audiomp3",
  "audiopwmio",
  "board",
  "busio",
  "countio",
  "digitalio",
  "displayio",
  "esp32",
  "keypad",
  "microcontroller",
  "pwmio",
  "rainbowio",
  "rtc",
  "socketpool",
  "storage",
  "supervisor",
  "time",
  "touchio",
  "usb_cdc",
  "usb_hid",
  "wifi",
]);

const circuitPythonLibraryModules = new Set(
  Object.keys(circuitPythonLibraryCatalog.modules)
);

const isCircuitPythonImport = (line: string) => {
  const match = /^\s*(?:from|import)\s+([\w.]+)/.exec(line);
  if (!match) return false;
  const module = match[1].split(".")[0];
  return (
    circuitPythonBuiltinModules.has(module) ||
    circuitPythonLibraryModules.has(module)
  );
};

const isCircuitPythonDiagnostic = (
  document: Text,
  from: number,
  _to: number,
  code: LSP.Diagnostic["code"]
) => {
  const line = document.lineAt(from).text;
  // Catalog-only libraries may not have editor types yet. Real attribute/call
  // diagnostics for typed CircuitPython APIs must remain visible.
  return code === "reportMissingImports" && isCircuitPythonImport(line);
};

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
  [LSP.DiagnosticSeverity.Hint]: "hint",
} as const;

export const diagnosticsMapping = (
  document: Text,
  lspDiagnostics: LSP.Diagnostic[],
  device: MicrobitUSBConnection,
  warnOnV2OnlyFeatures: boolean,
  warnOnV2OnlyFeaturesAction: () => Action,
  intl?: IntlShape
): Diagnostic[] =>
  lspDiagnostics
    .map(({ range, message, severity, tags, code }): Diagnostic | undefined => {
      // Only show warnings for using V2 API features if a V1 board is connected
      // and warnOnV2OnlyFeatures setting is on.
      if (
        code === reportMicrobitVersionApiUnsupported &&
        (!warnOnV2OnlyFeatures ||
          device.status !== ConnectionStatus.Connected ||
          device.getBoardVersion() !== "V1")
      ) {
        return undefined;
      }

      const from = positionToOffset(document, range.start);
      const to = positionToOffset(document, range.end);
      // Skip if we can't map to the current document.
      if (from !== undefined && to !== undefined && to >= from) {
        if (isCircuitPythonDiagnostic(document, from, to, code)) {
          return undefined;
        }
        const sensor =
          code === "reportUndefinedVariable"
            ? missingSensorInitialization(document.toString(), from, to)
            : undefined;
        return {
          from,
          to,
          // Missing severity is client defined. Warn for now.
          severity: severityMapping[severity ?? LSP.DiagnosticSeverity.Warning],
          message:
            sensor && intl
              ? intl.formatMessage(
                  { id: "sensor-initialization-missing" },
                  {
                    variable: sensor.variable,
                    block: intl.locale.startsWith("de")
                      ? sensor.block
                      : sensor.englishBlock,
                  }
                )
              : typeof message === "string"
              ? message
              : message.value,
          tags: tags ? tags.map(convertTag) : undefined,
          actions:
            sensor && intl
              ? [
                  {
                    name: intl.formatMessage({
                      id: "sensor-initialization-show",
                    }),
                    apply: () => {
                      window.document.dispatchEvent(
                        new CustomEvent("cm/openDocs", {
                          detail: { tab: "sensoren", id: sensor.slug },
                        })
                      );
                    },
                  },
                ]
              : code === reportMicrobitVersionApiUnsupported
              ? [warnOnV2OnlyFeaturesAction()]
              : [],
        };
      }
      return undefined;
    })
    .filter((x): x is Diagnostic => Boolean(x));

const convertTag = (tag: LSP.DiagnosticTag): string => {
  switch (tag) {
    case LSP.DiagnosticTag.Deprecated:
      return "deprecated";
    case LSP.DiagnosticTag.Unnecessary:
      return "unnecessary";
    default:
      throw new Error("Unsupported tag.");
  }
};
