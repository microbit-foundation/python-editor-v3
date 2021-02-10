import { indentUnit, syntaxTree } from "@codemirror/language"
import { EditorView, themeClass, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { EditorState, Extension } from "@codemirror/state";

// Names from https://github.com/lezer-parser/python/blob/master/src/python.grammar
const grammarInfo = {
  // Unhlighlighted for now. There's also Body to consider for compound statements.
  // Need to consider and perhaps special case single line bodies (line continuations?)
  smallStatement: new Set([
    "AssignStatement",
    "UpdateStatement",
    "ExpressionStatement",
    "DeleteStatement",
    "PassStatement",
    "BreakStatement",
    "ContinueStatement",
    "ReturnStatement",
    "YieldStatement",
    "PrintStatement",
    "RaiseStatement",
    "ImportStatement",
    "ScopeStatement",
    "AssertStatement"
  ]),
  compoundStatement: new Set([
    "IfStatement",
    "WhileStatement",
    "ForStatement",
    "TryStatement",
    "WithStatement",
    "FunctionDefinition",
    "ClassDefinition",
  ])
}

class VisualBlock {
  constructor(readonly left: number, readonly top: number, readonly width: number, readonly height: number) {
  }
  
  draw() {
    const elt = document.createElement("div");
    elt.className = themeClass("block");
    this.adjust(elt);
    return elt;
  }

  adjust(elt: HTMLElement) {
    elt.style.left = this.left + "px"
    elt.style.top = this.top + "px"
    elt.style.width = this.width + "px"
    elt.style.height = this.height + "px"
  }

  eq(other: VisualBlock) {
    return this.left == other.left && this.top == other.top && this.width == other.width && this.height == other.height;
  }
}

interface Measure {
  blocks: VisualBlock[];
}

const overlayView = ViewPlugin.fromClass(class {
  measureReq: {read: () => Measure, write: (value: Measure) => void}
  overlayLayer: HTMLElement
  blocks: VisualBlock[] = []

  constructor(readonly view: EditorView) {
    this.measureReq = {read: this.readBlocks.bind(this), write: this.drawBlocks.bind(this)}
    this.overlayLayer = view.scrollDOM.appendChild(document.createElement("div"))
    this.overlayLayer.className = themeClass("blockLayer")
    this.overlayLayer.setAttribute("aria-hidden", "true")
    view.requestMeasure(this.measureReq)
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.geometryChanged || update.viewportChanged) {
      this.view.requestMeasure(this.measureReq)
    }
  }

  readBlocks(): Measure {
    const view = this.view;
    const { state } = view;
    const leftEdge = view.contentDOM.getBoundingClientRect().left - view.scrollDOM.getBoundingClientRect().left;
    const contentDOMWidth = view.contentDOM.getBoundingClientRect().width;
    const indentWidth = state.facet(indentUnit).length * view.defaultCharacterWidth;

    const blocks: VisualBlock[] = [];
    // We could throw away blocks if we tracked returning to the top-level or started from
    // the closest top-level node. Otherwise we need to render them because they overlap.
    let depth = 0;
    const tree = syntaxTree(state);
    if (tree) {
      tree.iterate({
        enter: (type, _start) => {
          if (grammarInfo.compoundStatement.has(type.name)) {
            depth++;
          }
        },
        leave: (type, start, end) => {
          if (grammarInfo.compoundStatement.has(type.name)) {
            const top = view.visualLineAt(start).top
            const bottom = view.visualLineAt(end -1).bottom
            const height = bottom - top;
            const leftIndent = (depth - 1) * indentWidth;
            const left = leftEdge + leftIndent;
            const width = contentDOMWidth - leftIndent;
            blocks.push(new VisualBlock(left, top, width, height));
            depth--;
          }
        }
      })
    }

    return { blocks };
  }

  drawBlocks({ blocks }: Measure) {
    const blocksChanged = blocks.length !== this.blocks.length || blocks.some((b, i) => !b.eq(this.blocks[i]));
    if (blocksChanged) {
      this.blocks = blocks;

      // Should be able to adjust old elements here if it's a performance win,
      // but didn't work for me. See e.g. draw-selection.ts in codemirror for the pattern.
      this.overlayLayer.textContent = ""
      for (const b of blocks) {
        this.overlayLayer.appendChild(b.draw())
      }
    }
  }

  destroy() {
    this.overlayLayer.remove();
  }
});

const skipTrailingBlankLines = (state: EditorState, position: number) => {
  let line = state.doc.lineAt(position);
  while ((line.length === 0 || /^\s+$/.test(line.text)) && line.number >= 1) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
}

const baseTheme = EditorView.baseTheme({
  $blockLayer: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    // What about touch? Can we just put it behind?
    // If we had interactive elements we could have another layer on top.
    "pointerEvents": "none"
  },
  $block: {
    display: "block",
    position: "absolute",
    backgroundColor: "#34a2eb",
    opacity: "6%",
    border: "1px solid black"
  },
})

export const overlay = (): Extension => [overlayView, baseTheme];
