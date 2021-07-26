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
import { CodeStructureSettings } from ".";
import { skipBodyTrailers } from "./doc-util";
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

export const codeStructureView = (settings: CodeStructureSettings) =>
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
        this.overlayLayer.className = "cm-cs--layer";
        // Add classes to activate CSS for the various settings.
        this.overlayLayer.classList.add(
          this.lShape ? "cm-cs--lshapes" : "cm-cs--boxes"
        );
        this.overlayLayer.classList.add(
          "cm-cs--background-" + settings.background
        );
        if (settings.hoverBackground) {
          this.overlayLayer.classList.add("cm-cs--hover-background");
        }
        if (settings.cursorBackground) {
          this.overlayLayer.classList.add("cm-cs--cursor-background");
        }
        if (settings.hoverBorder) {
          this.overlayLayer.classList.add("cm-cs--hover-border");
        }
        if (settings.cursorBorder) {
          this.overlayLayer.classList.add("cm-cs--cursor-border");
        }

        this.overlayLayer.classList.add("cm-cs--borders-" + settings.borders);
        this.overlayLayer.setAttribute("aria-hidden", "true");
        view.requestMeasure(this.measureReq);
      }

      update(update: ViewUpdate) {
        // We can probably limit this but we need to know when the language state has changed as parsing has occurred.
        this.view.requestMeasure(this.measureReq);
      }

      readBlocks(): Measure {
        let cursorFound = false;

        const positionsForNode = (
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
          const bottomLine = view.visualLineAt(
            skipBodyTrailers(state, end - 1)
          );
          const bottom = bottomLine.bottom;
          const height = bottom - top;
          const leftIndent = depth * indentWidth;
          const left = leftEdge + leftIndent;
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

        const view = this.view;
        const { state } = view;

        const bodyPullBack = this.lShape && settings.background !== "none";
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
                // Draw an l-shape for each run of non-Body (e.g. keywords, test expressions) followed by Body in the child list.
                let runStart = 0;
                for (let i = 0; i < children.length; ++i) {
                  if (children[i].name === "Body") {
                    const startNode = children[runStart];
                    const bodyNode = children[i];

                    const parentPositions = this.lShape
                      ? positionsForNode(
                          view,
                          startNode.start,
                          bodyNode.start,
                          depth,
                          false
                        )
                      : undefined;
                    const bodyPositions = positionsForNode(
                      view,
                      bodyNode.start,
                      bodyNode.end,
                      depth + 1,
                      true
                    );
                    blocks.push(
                      new VisualBlock(
                        bodyPullBack,
                        parentPositions,
                        bodyPositions
                      )
                    );
                    runStart = i + 1;
                  }
                }
                if (!this.lShape) {
                  // Draw a box for the parent compound statement as a whole (may have multiple child Bodys)
                  const parentPositions = positionsForNode(
                    view,
                    start,
                    end,
                    depth,
                    false
                  );
                  blocks.push(
                    new VisualBlock(bodyPullBack, parentPositions, undefined)
                  );
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
        return { blocks: blocks.reverse() };
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
