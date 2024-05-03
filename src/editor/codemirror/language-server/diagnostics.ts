/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Text } from "@codemirror/state";
import * as LSP from "vscode-languageserver-protocol";
import { Diagnostic } from "../lint/lint";
import { positionToOffset } from "./positions";
import { DeviceConnection } from "../../../device/device";

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
  [LSP.DiagnosticSeverity.Hint]: "hint",
} as const;

export const diagnosticsMapping = (
  document: Text,
  lspDiagnostics: LSP.Diagnostic[],
  device: DeviceConnection
): Diagnostic[] =>
  lspDiagnostics
    .map(({ range, message, severity, tags, code }): Diagnostic | undefined => {
      // Only show warnings for using V2 API features if a V1 board is connected.
      if (
        code === "reportMicrobitV2ApiUse" &&
        device.getBoardVersion() !== "V1"
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
