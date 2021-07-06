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

// If we keep a background approach then we should simplify this so we create one per box.
// Kept in one block for now in case we want to draw lines, so it's easier to experiment
// with visualisations.
class VisualBlock {
  constructor(
    readonly name: string,
    readonly depth: number,
    readonly parent?: Positions,
    readonly body?: Positions
  ) {}

  draw() {
    let parent: HTMLElement | undefined;
    let body: HTMLElement | undefined;
    const bg = this.depth % 2 === 0 ? "cm-lshapebox-bg1" : "cm-lshapebox-bg2";
    if (this.parent) {
      parent = document.createElement("div");
      parent.className = "cm-lshapebox";
      parent.classList.add(bg);
    }
    if (this.body) {
      body = document.createElement("div");
      body.className = "cm-lshapebox";
      body.classList.add(bg);
    }
    this.adjust(parent, body);
    return [parent, body].filter(Boolean) as HTMLElement[];
  }

  adjust(parent?: HTMLElement, body?: HTMLElement) {
    // Parent is just the bit before the colon.
    if (parent && this.parent) {
      parent.style.left = this.parent.left + "px";
      parent.style.top = this.parent.top + "px";
      parent.style.height = this.parent.height + "px";
      parent.style.width = `calc(100% - ${this.parent.left}px)`;
    }

    // Allows nested compound statements some breathing space
    if (body && this.body) {
      const dark = this.depth % 2 === 0;
      const bodyPullBack = 3;
      body.style.left = this.body.left - bodyPullBack + "px";
      body.style.top = this.body.top + "px";
      body.style.height = this.body.height + (dark ? 0 : 0) + "px";
      body.style.width = `calc(100% - ${this.body.left}px)`;
      body.style.borderTopLeftRadius = "unset";
    }
  }

  eq(other: VisualBlock) {
    return (
      ((!this.parent && !other.parent) ||
        (this.parent &&
          other.parent &&
          this.parent.left === other.parent.left &&
          this.parent.top === other.parent.top &&
          this.parent.height === other.parent.height)) &&
      ((!this.body && !other.body) ||
        (this.body &&
          other.body &&
          this.body.left === other.body.left &&
          this.body.top === other.body.top &&
          this.body.height === other.body.height))
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
              let start = 0;
              for (let i = 0; i < children.length; ++i) {
                if (children[i].name === "Body") {
                  let startNode = children[start];
                  let bodyNode = children[i];
                  let parentBox = nodeBox(
                    view,
                    startNode.start,
                    bodyNode.start,
                    depth,
                    false
                  );
                  let bodyBox = nodeBox(
                    view,
                    bodyNode.start,
                    bodyNode.end,
                    depth + 1,
                    true
                  );
                  blocks.push(
                    new VisualBlock(leaving.name, depth, parentBox, bodyBox)
                  );
                  start = i + 1;
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
      blocks.reverse();
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
  return { left, height, top };
};

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
    borderRadius: "var(--chakra-radii-lg)",
  },
  ".cm-lshapebox-bg1": {
    backgroundColor: "#CAEDF7", // "rgb(194, 230, 225)",
  },
  ".cm-lshapebox-bg2": {
    backgroundColor: "#DFE3FA", // "rgb(239, 247, 246)",
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
