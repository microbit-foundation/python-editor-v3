/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";
import { Action, Diagnostic } from "../lint/lint";
import { positionToOffset } from "./positions";
import { MicrobitWebUSBConnection } from "@microbit/microbit-connection";

const reportMicrobitVersionApiUnsupported =
  "reportMicrobitVersionApiUnsupported";

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
  [LSP.DiagnosticSeverity.Hint]: "hint",
} as const;

export const diagnosticsMapping = (
  document: Text,
  lspDiagnostics: LSP.Diagnostic[],
  device: MicrobitWebUSBConnection,
  warnOnV2OnlyFeatures: boolean,
  warnOnV2OnlyFeaturesAction: () => Action
): Diagnostic[] =>
  lspDiagnostics
    .map(({ range, message, severity, tags, code }): Diagnostic | undefined => {
      // Only show warnings for using V2 API features if a V1 board is connected
      // and warnOnV2OnlyFeatures setting is on.
      if (
        code === reportMicrobitVersionApiUnsupported &&
        (!warnOnV2OnlyFeatures || device.getBoardVersion() !== "V1")
      ) {
        return undefined;
      }

      let from = positionToOffset(document, range.start);
      let to = positionToOffset(document, range.end);
      // Skip if we can't map to the current document.
      if (from !== undefined && to !== undefined && to >= from) {
        return {
          from,
          to,
          // Missing severity is client defined. Warn for now.
          severity: severityMapping[severity ?? LSP.DiagnosticSeverity.Warning],
          message,
          tags: tags ? tags.map(convertTag) : undefined,
          actions:
            code === reportMicrobitVersionApiUnsupported
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
