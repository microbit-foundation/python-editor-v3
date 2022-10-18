/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */

import { EditorState, Line } from "@codemirror/state";
import { DecorationSet } from "@codemirror/view";

/**
 * Skip trailing content that we don't include in a block:
 *
 * 1. comments (regardless of indent)
 * 2. blank lines at the end of the body
 * 3. unreachable code
 *
 * @param state Document state.
 * @param position Document character position.
 * @param hints The unreachable code hints.
 * @param min The minimum line to consider.
 *
 * @returns End of last line we consider to be part of the body after
 *          skipping or undefined if we go past min.
 */
export const skipBodyTrailers = (
  state: EditorState,
  hints: DecorationSet | undefined,
  position: number,
  min: number = 0
): number | undefined => {
  for (
    let lineNumber = state.doc.lineAt(position).number;
    lineNumber >= min;
    lineNumber--
  ) {
    const line = state.doc.line(lineNumber);
    if (!isSkipLine(line, hints)) {
      return line.to;
    }
  }
  return undefined;
};

const isSkipLine = (line: Line, hints: DecorationSet | undefined) =>
  line.length === 0 ||
  /^\s+$/.test(line.text) ||
  /^\s*#/.test(line.text) ||
  overlapsUnnecessaryCode(hints, line.from, line.to);

export const overlapsUnnecessaryCode = (
  d: DecorationSet | undefined,
  from: number,
  to: number
) => {
  let overlaps: boolean = false;
  if (!d) {
    return overlaps;
  }
  d.between(from, to, (_from, _to, value) => {
    if (value.spec.diagnostic.tags?.includes("unnecessary")) {
      overlaps = true;
      return false;
    }
  });
  return overlaps;
};
