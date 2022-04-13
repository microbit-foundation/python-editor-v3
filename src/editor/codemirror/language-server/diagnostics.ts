/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Diagnostic } from "../lint/lint";
import { Text } from "@codemirror/text";
import * as LSP from "vscode-languageserver-protocol";
import { positionToOffset } from "./positions";

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
  [LSP.DiagnosticSeverity.Hint]: "info",
} as const;

export const diagnosticsMapping = (
  document: Text,
  diagnostics: LSP.Diagnostic[]
): Diagnostic[] =>
  diagnostics
    .map(({ range, message, severity }): Diagnostic | undefined => {
      let from = positionToOffset(document, range.start);
      let to = positionToOffset(document, range.end);

      // Skip if we can't map to the current document.
      if (from !== undefined && to !== undefined) {
        return {
          from,
          to,
          // Missing severity is client defined. Warn for now.
          severity: severityMapping[severity ?? LSP.DiagnosticSeverity.Warning],
          message,
        };
      }
      return undefined;
    })
    .filter((x): x is Diagnostic => !!x);
