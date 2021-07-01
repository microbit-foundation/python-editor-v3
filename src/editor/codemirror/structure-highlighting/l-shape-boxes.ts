/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import { EditorState, Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";

const grammarInfo = {
  compoundStatements: new Set([
    "IfStatement",
    "WhileStatement",
    "ForStatement",
    "TryStatement",
    "WithStatement",
    "FunctionDefinition",
    "ClassDefinition",
  ]),
};

interface Positions {
  top: number;
  left: number;
  height: number;
}

// Grammar is defined by https://github.com/lezer-parser/python/blob/master/src/python.grammar
class VisualBlock {
  constructor(
    readonly name: string,
    readonly parent: Positions,
    readonly body: Positions
  ) {}

  draw() {
    const parent = document.createElement("div");
    parent.className = "cm-lshapebox";
    const body = document.createElement("div");
    body.className = "cm-lshapebox";
    this.adjust(parent, body);
    return [parent, body];
  }

  adjust(parent: HTMLElement, body: HTMLElement) {
    // Parent covers the parent that isn't body
    parent.style.left = this.parent.left + "px";
    parent.style.top = this.parent.top + "px";
    parent.style.height = this.parent.height - this.body.height + "px";
    parent.style.width = `calc(100% - ${this.parent.left}px)`;

    body.style.left = this.body.left + "px";
    body.style.top = this.body.top + "px";
    body.style.height = this.body.height + "px";
    body.style.width = `calc(100% - ${this.body.left}px)`;
    body.style.borderTopLeftRadius = "unset";
  }

  eq(other: VisualBlock) {
    return (
      this.parent.left === other.parent.left &&
      this.parent.top === other.parent.top &&
      this.parent.height === other.parent.height &&
      this.body.left === other.body.left &&
      this.body.top === other.body.top &&
      this.body.height === other.body.height
    );
  }
}

interface Measure {
  blocks: VisualBlock[];
}

const blocksView = ViewPlugin.fromClass(
  class {
    measureReq: { read: () => Measure; write: (value: Measure) => void };
    overlayLayer: HTMLElement;
    blocks: VisualBlock[] = [];

    constructor(readonly view: EditorView) {
      this.measureReq = {
        read: this.readBlocks.bind(this),
        write: this.drawBlocks.bind(this),
      };
      this.overlayLayer = view.scrollDOM.appendChild(
        document.createElement("div")
      );
      this.overlayLayer.className = "cm-lshapeboxesLayer";
      this.overlayLayer.setAttribute("aria-hidden", "true");
      view.requestMeasure(this.measureReq);
    }

    update(update: ViewUpdate) {
      // We can probably limit this but we need to know when the language state has changed as parsing has occurred.
      this.view.requestMeasure(this.measureReq);
    }

    readBlocks(): Measure {
      const view = this.view;
      const { state } = view;
      const leftEdge =
        view.contentDOM.getBoundingClientRect().left -
        view.scrollDOM.getBoundingClientRect().left;
      const indentWidth =
        state.facet(indentUnit).length * view.defaultCharacterWidth;

      const blocks: VisualBlock[] = [];
      // We could throw away blocks if we tracked returning to the top-level or started from
      // the closest top-level node. Otherwise we need to render them because they overlap.
      // Should consider switching to tree cursors to avoid allocating syntax nodes.
      let depth = 0;
      const tree = syntaxTree(state);
      let bodies: { top: number; height: number; left: number }[] = [];
      if (tree) {
        tree.iterate({
          enter: (type, _start) => {
            if (type.name === "Body") {
              depth++;
            }
          },
          leave: (type, start, end) => {
            const isBodyParent =
              bodies.length > 0 &&
              grammarInfo.compoundStatements.has(type.name);
            const isBody = type.name === "Body";
            if (isBody) {
              // Skip past the colon starting the Body / block.
              // This needs to get smarter to deal with the single line version, e.g. `while True: pass`
              start = state.doc.lineAt(start).to + 1;

              const top = view.visualLineAt(start).top;
              const bottom = view.visualLineAt(
                // We also need to skip comments in a similar way, as they're extending our highlighting.
                skipTrailingBlankLines(state, end - 1)
              ).bottom;
              const height = bottom - top;
              const leftIndent = depth * indentWidth;
              const left = leftEdge + leftIndent;
              bodies.push({ left, height, top });

              depth--;
            } else if (isBodyParent) {
              // So this isn't recognising that a body parent can have multiple body children
              // e.g. if/elif/else while/else try/catch etc.
              //
              // In the syntax tree, these compound statements have a flat structure with all the bodies
              // as children of the, say, IfStatement interspersed with the other nodes (keywords, tests
              // etc.), see examples at
              // https://github.com/lezer-parser/python/blob/master/test/statement.txt
              // so we could just find compound statements and then work with their children
              // rather than the current mess :)
              //
              // Note that Body is defined as { ":" (simpleStatement | newline indent statement+ (dedent | eof)) }
              //
              //   IfStatement(if, BinaryExpression(Number, ArithOp, Number), Body(PassStatement(pass)),
              //   elif, BinaryExpression(Number, CompareOp, Number), Body(PassStatement(pass)),
              //   else, Body(PassStatement(pass))))
              //
              // if True:
              //     pass
              // else:
              //     pass
              //
              // But what highlighting do we want? Start by highlighting the shape above exactly,
              // so visually we'd have two cut-outs before the bodies and the rest highlighted.
              // So we'd need to pick out the child nodes and do a line-mapped box for ("if"..Body]
              // and one for Body
              // and one for ("else"..Body]
              // and one for Body
              //
              // So it'd take some work for each compound statement type but it could be data driven
              // based on specific child type names for each compound statement.

              const leftIndent = depth * indentWidth;
              const top = view.visualLineAt(start).top;
              const left = leftEdge + leftIndent;
              const bottom = view.visualLineAt(
                // We also need to skip comments in a similar way, as they're extending our highlighting.
                skipTrailingBlankLines(state, end - 1)
              ).bottom;
              const height = bottom - top;
              if (bodies.length > 0) {
                console.log(JSON.stringify(bodies));
                for (const body of bodies) {
                  const parent = { top, left, height };
                  blocks.push(new VisualBlock(type.name, parent, body));
                }
              }
              bodies.length = 0;
            }
          },
        });
      }
      return { blocks };
    }

    drawBlocks({ blocks }: Measure) {
      const blocksChanged =
        blocks.length !== this.blocks.length ||
        blocks.some((b, i) => !b.eq(this.blocks[i]));
      if (blocksChanged) {
        this.blocks = blocks;

        // Should be able to adjust old elements here if it's a performance win.
        this.overlayLayer.textContent = "";
        for (const b of blocks) {
          for (const e of b.draw()) {
            this.overlayLayer.appendChild(e);
          }
        }
      }
    }

    destroy() {
      this.overlayLayer.remove();
    }
  }
);

const skipTrailingBlankLines = (state: EditorState, position: number) => {
  let line = state.doc.lineAt(position);
  while ((line.length === 0 || /^\s+$/.test(line.text)) && line.number >= 1) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
};

const baseTheme = EditorView.baseTheme({
  ".cm-lshapeboxesLayer": {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: -1,
  },
  ".cm-lshapebox": {
    display: "block",
    position: "absolute",
    backgroundColor: "var(--chakra-colors-code-block)",
    borderRadius: "var(--chakra-radii-lg)",
  },
});

const themeTweaks = EditorView.theme({
  ".cm-activeLine": {
    // Can't use background colour for conflicting purposes.
    backgroundColor: "unset",
    outline: "1px solid var(--chakra-colors-gray-100)",
  },
});

export const lshapeBoxes = (): Extension => [
  blocksView,
  baseTheme,
  themeTweaks,
];
