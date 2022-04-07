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
        // If `from` is the end of one line and `to` is the beginning of another
        // then CM won't display the diagnostic inline. Shift the `to` to also
        // be at the end of the line. Can be removed in future, see
        // https://discuss.codemirror.net/t/diagnostics-for-the-range-from-end-of-a-line-to-the-start-of-the-next/3495
        if (
          from + 1 === to &&
          document.lineAt(from).number + 1 === document.lineAt(to).number
        ) {
          to = from;
        }

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
