/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState } from "@codemirror/state";
import { Decoration } from "@codemirror/view";
import { overlapsUnnecessaryCode, skipBodyTrailers } from "./doc-util";

// Mirrors the decoration spec used by lint.ts, which is what we read in practice.
const diagnosticDecorations = (
  ranges: { from: number; to: number; tags?: string[] }[]
) =>
  Decoration.set(
    ranges.map(({ from, to, tags }) =>
      Decoration.mark({ diagnostic: { tags } }).range(from, to)
    )
  );

describe("skipBodyTrailers", () => {
  const check = (doc: string, position: number) =>
    skipBodyTrailers(EditorState.create({ doc }), undefined, position, 1);

  it("returns end of line for content", () => {
    const doc = "while True:\n    pass";
    expect(check(doc, doc.length - 1)).toEqual(doc.length);
  });

  it("skips trailing blank lines", () => {
    const doc = "while True:\n    pass\n\n\n";
    expect(check(doc, doc.length - 1)).toEqual("while True:\n    pass".length);
  });

  it("skips whitespace-only lines", () => {
    const doc = "while True:\n    pass\n   \n";
    expect(check(doc, doc.length - 1)).toEqual("while True:\n    pass".length);
  });

  it("skips comment lines regardless of indent", () => {
    const doc = "while True:\n    pass\n    # comment\n# comment\n";
    expect(check(doc, doc.length - 1)).toEqual("while True:\n    pass".length);
  });

  it("returns undefined when everything is skippable", () => {
    expect(check("# comment\n\n", 10)).toBeUndefined();
  });

  it("skips lines flagged as unnecessary code", () => {
    const doc = "while True:\n    pass\n    unreachable()";
    const state = EditorState.create({ doc });
    const unreachableFrom = doc.indexOf("unreachable");
    const hints = diagnosticDecorations([
      { from: unreachableFrom, to: doc.length, tags: ["unnecessary"] },
    ]);
    expect(skipBodyTrailers(state, hints, doc.length - 1, 1)).toEqual(
      "while True:\n    pass".length
    );
  });
});

describe("overlapsUnnecessaryCode", () => {
  it("false for no decorations", () => {
    expect(overlapsUnnecessaryCode(undefined, 0, 10)).toEqual(false);
    expect(overlapsUnnecessaryCode(Decoration.none, 0, 10)).toEqual(false);
  });

  it("true for overlapping unnecessary diagnostic", () => {
    const decorations = diagnosticDecorations([
      { from: 5, to: 8, tags: ["unnecessary"] },
    ]);
    expect(overlapsUnnecessaryCode(decorations, 0, 10)).toEqual(true);
    expect(overlapsUnnecessaryCode(decorations, 6, 7)).toEqual(true);
  });

  it("false for non-overlapping ranges", () => {
    const decorations = diagnosticDecorations([
      { from: 5, to: 8, tags: ["unnecessary"] },
    ]);
    expect(overlapsUnnecessaryCode(decorations, 20, 30)).toEqual(false);
  });

  it("false for other or missing tags", () => {
    const decorations = diagnosticDecorations([
      { from: 5, to: 8, tags: ["deprecated"] },
      { from: 5, to: 8 },
    ]);
    expect(overlapsUnnecessaryCode(decorations, 0, 10)).toEqual(false);
  });
});
