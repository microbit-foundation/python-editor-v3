/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import { Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { skipTrailingBlankLines } from "./doc-util";
import { baseTheme, themeTweakForBackgrounds } from "./theme";
import { Positions, VisualBlock } from "./visual-block";

// Grammar is defined by https://github.com/lezer-parser/python/blob/master/src/python.grammar
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

interface Measure {
  blocks: VisualBlock[];
}

const codeStructureView = (settings: CodeStructureSettings) =>
  ViewPlugin.fromClass(
    class {
      measureReq: { read: () => Measure; write: (value: Measure) => void };
      overlayLayer: HTMLElement;
      blocks: VisualBlock[] = [];
      lShape = settings.shape === "l-shape";

      constructor(readonly view: EditorView) {
        this.measureReq = {
          read: this.readBlocks.bind(this),
          write: this.drawBlocks.bind(this),
        };
        this.overlayLayer = view.scrollDOM.appendChild(
          document.createElement("div")
        );
        this.overlayLayer.className = "cm-codeStructureLayer";
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
        const blocks: VisualBlock[] = [];
        // We could throw away blocks if we tracked returning to the top-level or started from
        // the closest top-level node. Otherwise we need to render them because they overlap.
        // Should consider switching to tree cursors to avoid allocating syntax nodes.
        let depth = 0;
        const tree = syntaxTree(state);
        const parents: {
          name: string;
          children?: { name: string; start: number; end: number }[];
        }[] = [];
        if (tree) {
          tree.iterate({
            enter: (type, _start) => {
              parents.push({ name: type.name });
              if (type.name === "Body") {
                depth++;
              }
            },
            leave: (type, start, end) => {
              if (type.name === "Body") {
                depth--;
              }

              const leaving = parents.pop()!;
              const children = leaving.children;
              if (children) {
                if (!this.lShape) {
                  // Draw a box for the parent compound statement as a whole (may have multiple child Bodys)
                  const parentBox = nodeBox(view, start, end, depth, false);
                  blocks.push(new VisualBlock(parentBox, undefined));
                }

                // Draw an l-shape for each run of non-Body (e.g. keywords, test expressions) followed by Body in the child list.
                let runStart = 0;
                for (let i = 0; i < children.length; ++i) {
                  if (children[i].name === "Body") {
                    let startNode = children[runStart];
                    let bodyNode = children[i];

                    let parentBox = this.lShape
                      ? nodeBox(
                          view,
                          startNode.start,
                          bodyNode.start,
                          depth,
                          false
                        )
                      : undefined;
                    let bodyBox = nodeBox(
                      view,
                      bodyNode.start,
                      bodyNode.end,
                      depth + 1,
                      true
                    );
                    blocks.push(new VisualBlock(parentBox, bodyBox));
                    runStart = i + 1;
                  }
                }
              }

              // Poke our information into our parent if we need to track it.
              const parent = parents[parents.length - 1];
              if (parent && grammarInfo.compoundStatements.has(parent.name)) {
                if (!parent.children) {
                  parent.children = [];
                }
                parent.children.push({ name: type.name, start, end });
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

const nodeBox = (
  view: EditorView,
  start: number,
  end: number,
  depth: number,
  body: boolean
) => {
  const state = view.state;
  const leftEdge =
    view.contentDOM.getBoundingClientRect().left -
    view.scrollDOM.getBoundingClientRect().left;
  const indentWidth =
    state.facet(indentUnit).length * view.defaultCharacterWidth;

  let topLine = view.visualLineAt(start);
  if (body) {
    topLine = view.visualLineAt(topLine.to + 1);
    if (topLine.from > end) {
      // If we've fallen out of the scope of the body then the statement is all on
      // one line, e.g. "if True: pass". Avoid highlighting for now.
      return undefined;
    }
  }
  const top = topLine.top;
  const bottom = view.visualLineAt(
    // We also need to skip comments in a similar way, as they're extending our highlighting.
    skipTrailingBlankLines(state, end - 1)
  ).bottom;
  const height = bottom - top;
  const leftIndent = depth * indentWidth;
  const left = leftEdge + leftIndent;
  return new Positions(top, left, height);
};

export interface CodeStructureSettings {
  shape: "l-shape" | "box";
  background: "block" | "none";
  borders: "borders" | "no-borders" | "left-edge-only";

  hoverBackground?: boolean;
  cursorBackground?: boolean;
  hoverBorder?: boolean;
  cursorBorder?: boolean;
}

export const codeStructure = (settings: CodeStructureSettings): Extension => [
  codeStructureView(settings),
  baseTheme,
  settings.background !== "none" ||
  settings.cursorBackground ||
  settings.hoverBackground
    ? themeTweakForBackgrounds
    : [],
];
