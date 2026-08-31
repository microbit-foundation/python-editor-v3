/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { python } from "@codemirror/lang-python";
import { syntaxTree } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { codeBlocks, grammarInfo } from "./blocks";

/**
 * These tests pin the parts of the @lezer/python grammar that the code
 * structure highlighting relies on: the node names in grammarInfo and
 * the shape of compound statements as runs of header nodes each
 * followed by a "Body" node. If a grammar upgrade renames or
 * restructures these nodes the highlighting silently disappears, so we
 * assert the contract here.
 */

const createState = (doc: string): EditorState => {
  const state = EditorState.create({ doc, extensions: [python()] });
  // Headless, only the initial parse budget applies and codeBlocks reads
  // syntaxTree(state), so a large document would silently produce a
  // partial tree. Fine for the small documents here, but fail loudly.
  if (syntaxTree(state).length < state.doc.length) {
    throw new Error("Document too large for the initial headless parse");
  }
  return state;
};

interface BlockRun {
  statement: string;
  /** 1-based line of the start of the run (the if/elif/else etc. line). */
  headerLine: number;
  /** 1-based line of the last line of the body. */
  bodyEndLine: number;
  depth: number;
}

const blockRuns = (doc: string): BlockRun[] => {
  const state = createState(doc);
  const lineOf = (pos: number) => state.doc.lineAt(pos).number;
  return codeBlocks(state)
    .map(({ statement, start, bodyEnd, depth }) => ({
      statement,
      headerLine: lineOf(start),
      // Body's "to" extends to the start of what follows, hence -1, as
      // view.ts assumes when it uses skipBodyTrailers.
      bodyEndLine: lineOf(bodyEnd - 1),
      depth,
    }))
    .sort((a, b) => a.headerLine - b.headerLine);
};

describe("structure highlighting grammar contract", () => {
  it("if/elif/else produces a run per branch", () => {
    expect(
      blockRuns("if a:\n    pass\nelif b:\n    pass\nelse:\n    pass\n")
    ).toEqual([
      { statement: "IfStatement", headerLine: 1, bodyEndLine: 2, depth: 0 },
      { statement: "IfStatement", headerLine: 3, bodyEndLine: 4, depth: 0 },
      { statement: "IfStatement", headerLine: 5, bodyEndLine: 6, depth: 0 },
    ]);
  });

  it("while produces a single run", () => {
    expect(blockRuns("while True:\n    pass\n    pass\n")).toEqual([
      { statement: "WhileStatement", headerLine: 1, bodyEndLine: 3, depth: 0 },
    ]);
  });

  it("for/else produces two runs", () => {
    expect(blockRuns("for x in y:\n    pass\nelse:\n    pass\n")).toEqual([
      { statement: "ForStatement", headerLine: 1, bodyEndLine: 2, depth: 0 },
      { statement: "ForStatement", headerLine: 3, bodyEndLine: 4, depth: 0 },
    ]);
  });

  it("try/except/finally produces a run per clause", () => {
    expect(
      blockRuns(
        "try:\n    pass\nexcept ValueError:\n    pass\nfinally:\n    pass\n"
      )
    ).toEqual([
      { statement: "TryStatement", headerLine: 1, bodyEndLine: 2, depth: 0 },
      { statement: "TryStatement", headerLine: 3, bodyEndLine: 4, depth: 0 },
      { statement: "TryStatement", headerLine: 5, bodyEndLine: 6, depth: 0 },
    ]);
  });

  it("with produces a single run", () => {
    expect(blockRuns("with open('f') as f:\n    pass\n")).toEqual([
      { statement: "WithStatement", headerLine: 1, bodyEndLine: 2, depth: 0 },
    ]);
  });

  it("function definitions produce a single run", () => {
    expect(blockRuns("def foo(a, b=1):\n    pass\n")).toEqual([
      {
        statement: "FunctionDefinition",
        headerLine: 1,
        bodyEndLine: 2,
        depth: 0,
      },
    ]);
  });

  it("class definitions produce a single run", () => {
    expect(blockRuns("class Foo:\n    def bar(self):\n        pass\n")).toEqual(
      [
        {
          statement: "ClassDefinition",
          headerLine: 1,
          bodyEndLine: 3,
          depth: 0,
        },
        {
          statement: "FunctionDefinition",
          headerLine: 2,
          bodyEndLine: 3,
          depth: 1,
        },
      ]
    );
  });

  it("nested statements produce runs at each level", () => {
    expect(
      blockRuns("while True:\n    if a:\n        pass\n    pass\n")
    ).toEqual([
      { statement: "WhileStatement", headerLine: 1, bodyEndLine: 4, depth: 0 },
      { statement: "IfStatement", headerLine: 2, bodyEndLine: 3, depth: 1 },
    ]);
  });

  it("returns blocks innermost first", () => {
    // The view relies on this order to attribute the cursor to the
    // innermost enclosing block.
    const state = createState("while True:\n    if a:\n        pass\n");
    expect(codeBlocks(state).map((b) => b.statement)).toEqual([
      "IfStatement",
      "WhileStatement",
    ]);
  });

  it("single-line compound statements have body on the header line", () => {
    // view.ts skips drawing these; it relies on the body resolving to the same line.
    expect(blockRuns("if a: pass\n")).toEqual([
      { statement: "IfStatement", headerLine: 1, bodyEndLine: 1, depth: 0 },
    ]);
  });

  it("covers every compound statement name in grammarInfo", () => {
    const samples = [
      "if a:\n    pass\n",
      "while True:\n    pass\n",
      "for x in y:\n    pass\n",
      "try:\n    pass\nexcept:\n    pass\n",
      "with a:\n    pass\n",
      "def foo():\n    pass\n",
      "class Foo:\n    pass\n",
    ];
    const seen = new Set(
      samples.flatMap((doc) => blockRuns(doc).map((r) => r.statement))
    );
    expect([...grammarInfo.compoundStatements].sort()).toEqual(
      [...seen].sort()
    );
  });
});
