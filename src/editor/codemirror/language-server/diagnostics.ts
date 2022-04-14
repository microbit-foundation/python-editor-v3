/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Diagnostic } from "../lint/lint";
import { Text } from "@codemirror/text";
import * as LSP from "vscode-languageserver-protocol";
import { positionToOffset } from "./positions";
import { Hint, HintTag } from "../lint/hints";

const severityMapping = {
  [LSP.DiagnosticSeverity.Error]: "error",
  [LSP.DiagnosticSeverity.Warning]: "warning",
  [LSP.DiagnosticSeverity.Information]: "info",
} as const;

interface ConvertedDiagnostics {
  diagnostics: Diagnostic[];
  hints: Hint[];
}

export const diagnosticsMapping = (
  document: Text,
  lspDiagnostics: LSP.Diagnostic[]
): ConvertedDiagnostics => {
  const hints: Hint[] = [];
  const diagnostics: Diagnostic[] = [];
  for (const { range, message, severity, tags } of lspDiagnostics) {
    let from = positionToOffset(document, range.start);
    let to = positionToOffset(document, range.end);

    // Skip if we can't map to the current document.
    if (from !== undefined && to !== undefined) {
      if (severity === LSP.DiagnosticSeverity.Hint) {
        // Skip if there are no tags or we don't understand them.
        if (tags && tags.length > 0) {
          const mappedTags = tags
            .map(convertTag)
            .filter((x): x is HintTag => !!x);
          if (mappedTags.length > 0) {
            hints.push({
              from,
              to,
              message,
              tags: mappedTags,
            });
          }
        }
      } else {
        diagnostics.push({
          from,
          to,
          // Missing severity is client defined. Warn for now.
          severity: severityMapping[severity ?? LSP.DiagnosticSeverity.Warning],
          message,
        });
      }
    }
  }
  return { hints, diagnostics };
};

const convertTag = (tag: LSP.DiagnosticTag): HintTag | undefined => {
  switch (tag) {
    case LSP.DiagnosticTag.Deprecated:
      return "deprecated";
    case LSP.DiagnosticTag.Unnecessary:
      return "unnecessary";
    default:
      return undefined;
  }
};
