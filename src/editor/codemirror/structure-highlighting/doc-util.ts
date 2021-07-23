/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { EditorState } from "@codemirror/state";

/**
 * Skips trailing comments (regardless of indent) and blank lines at the end of the body.
 *
 * @param state Document state.
 * @param position Document character position.
 * @returns End of last line we consider to be part of the body after skipping.
 */
export const skipBodyTrailers = (state: EditorState, position: number) => {
  let line = state.doc.lineAt(position);
  while (
    line.number >= 1 &&
    (line.length === 0 || /^\s+$/.test(line.text) || /^\s*#/.test(line.text))
  ) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
};
