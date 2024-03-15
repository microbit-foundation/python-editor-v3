/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { lintState } from "../lint/lint";
import { overlapsUnnecessaryCode, skipBodyTrailers } from "./doc-util";
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

class Measure {
  constructor(
    readonly width: number,
    readonly left: number,
    readonly blocks: VisualBlock[]
  ) {}
  eq(other: Measure) {
    if (this.width !== other.width) {
      return false;
    }
    if (this.left !== other.left) {
      return false;
    }
    const blocksChanged =
      other.blocks.length !== this.blocks.length ||
      other.blocks.some((b, i) => !b.eq(this.blocks[i]));
    if (blocksChanged) {
      return false;
    }
    return true;
  }
}

export const codeStructureView = (option: "full" | "simple") =>
  ViewPlugin.fromClass(
    class {
      measureReq: { read: () => Measure; write: (value: Measure) => void };
      overlayLayer: HTMLElement;
      lastMeasure: Measure = new Measure(0, 0, []);

      constructor(readonly view: EditorView) {
        this.measureReq = {
          read: this.readBlocks.bind(this),
          write: this.drawBlocks.bind(this),
        };
        this.overlayLayer = view.scrollDOM.appendChild(
          document.createElement("div")
        );
        this.overlayLayer.className = "cm-cs--layer";
        this.overlayLayer.classList.add("cm-cs--mode-" + option);
        this.overlayLayer.setAttribute("aria-hidden", "true");
        view.requestMeasure(this.measureReq);
      }

      update(_update: ViewUpdate) {
        // We can probably limit this but we need to know when the language state has changed as parsing has occurred.
        this.view.requestMeasure(this.measureReq);
      }

      readBlocks(): Measure {
        const view = this.view;
        const { state } = view;

        const contentDOMRect = view.contentDOM.getBoundingClientRect();
        // The gutter is awkward as its position fixed in the scroller.
        const gutterWidth =
          view.scrollDOM.firstElementChild!.getBoundingClientRect().width;
        const width = contentDOMRect.width;

        let cursorFound = false;

        /**
         * Calculate visual positions for a node from start/end.
         *
         * @param view The view.
         * @param start The start position.
         * @param end The end position.
         * @param depth Current indent depth (1 per indent level starting at 0).
         * @param parent The parent positions (e.g. for the while block) if we're calculating body positions, otherwise undefined.
         * @returns The positions for the block denoted by start/end or undefined if highlighting should be skipped.
         */
        const positionsForNode = (
          view: EditorView,
          start: number,
          end: number,
          depth: number,
          parent: Positions | undefined
        ): Positions | undefined => {
          const diagnostics = state.field(lintState, false)?.diagnostics;
          const indentWidth =
            state.facet(indentUnit).length * view.defaultCharacterWidth;
          let topLine = view.lineBlockAt(start);
          if (parent) {
            if (topLine.to + 1 < view.state.doc.length) {
              topLine = view.lineBlockAt(topLine.to + 1);
            } else {
              // There's no next line.
              return undefined;
            }
            if (parent.top === topLine.top) {
              // It's the same line, e.g. if True: pass
              return undefined;
            }
          }

          if (overlapsUnnecessaryCode(diagnostics, topLine.from, topLine.to)) {
            return undefined;
          }

          const topLineNumber = state.doc.lineAt(topLine.from).number;
          const bottomPos = skipBodyTrailers(
            state,
            diagnostics,
            end - 1,
            topLineNumber
          );
          if (!bottomPos) {
            // Not sure if this is possible in practice due to the grammar,
            // but best to bail if we encounter it in error scenarios.
            return undefined;
          }
          const bottomLine = view.lineBlockAt(bottomPos);
          const top = topLine.top;
          const bottom = bottomLine.bottom;
          const height = bottom - top;
          const leftIndent = depth * indentWidth;
          const left = leftIndent;
          const mainCursor = state.selection.main.head;
          const cursorActive =
            !cursorFound &&
            mainCursor >= topLine.from &&
            mainCursor <= bottomLine.to;
          if (cursorActive) {
            cursorFound = true;
          }
          return new Positions(top, left, height, cursorActive);
        };

        const bodyPullBack = option === "full";
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
            enter: (node) => {
              parents.push({ name: node.type.name });
              if (node.type.name === "Body") {
                depth++;
              }
            },
            leave: (node) => {
              if (node.type.name === "Body") {
                depth--;
              }

              const leaving = parents.pop()!;
              const children = leaving.children;
              if (children) {
                // Draw an l-shape for each run of non-Body (e.g. keywords, test expressions) followed by Body in the child list.
                let runStart = 0;
                for (let i = 0; i < children.length; ++i) {
                  if (children[i].name === "Body") {
                    const startNode = children[runStart];
                    const bodyNode = children[i];

                    const parentPositions = positionsForNode(
                      view,
                      startNode.start,
                      bodyNode.start,
                      depth,
                      undefined
                    );
                    const bodyPositions = positionsForNode(
                      view,
                      bodyNode.start,
                      bodyNode.end,
                      depth + 1,
                      parentPositions
                    );
                    if (parentPositions && bodyPositions) {
                      blocks.push(
                        new VisualBlock(
                          bodyPullBack,
                          width,
                          parentPositions,
                          bodyPositions
                        )
                      );
                    }
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
                parent.children.push({
                  name: node.type.name,
                  start: node.from,
                  end: node.to,
                });
              }
            },
          });
        }
        return new Measure(width, gutterWidth, blocks.reverse());
      }

      drawBlocks(measure: Measure) {
        if (!measure.eq(this.lastMeasure)) {
          this.lastMeasure = measure;
          const { blocks, left, width } = measure;

          this.overlayLayer.style.width = width + "px";
          this.overlayLayer.style.left = left + "px";

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
