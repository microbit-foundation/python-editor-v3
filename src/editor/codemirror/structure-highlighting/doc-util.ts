/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { EditorState } from "@codemirror/state";

export const skipTrailingBlankLines = (
  state: EditorState,
  position: number
) => {
  let line = state.doc.lineAt(position);
  while ((line.length === 0 || /^\s+$/.test(line.text)) && line.number >= 1) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
};
