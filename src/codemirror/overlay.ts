import { indentUnit, syntaxTree } from "@codemirror/language"
import { BlockInfo, EditorView, themeClass, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { CharCategory, EditorState, Extension } from "@codemirror/state";

// Names from https://github.com/lezer-parser/python/blob/master/src/python.grammar
const grammarInfo = {
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

interface FixedDimensions {
  leftEdge: number;
  indentPixelWidth: number;
  contentDOMWidth: number;
}

class VisualBlock {
  constructor(readonly typeName: string, readonly startTop: number, readonly endBottom: number, readonly depth: number) {
  }
  
  draw(fixed: FixedDimensions) {
    const elt = document.createElement("div");
    // These need to move to the theme.
    elt.style.display = "block";
    elt.style.position = "absolute";
    elt.style.backgroundColor = "#34a2eb";
    elt.style.opacity = "8%";
    elt.style.border = "1px solid black"

    this.adjust(fixed, elt);
    return elt;
  }

  adjust(fixed: FixedDimensions, elt: HTMLElement) {
    const left = fixed.leftEdge + this.depth * fixed.indentPixelWidth;
    elt.style.left = `${left}px`;
    elt.style.top = `${this.startTop}px`;
    elt.style.height = `${this.endBottom - this.startTop}px`;
    elt.style.width = `${fixed.contentDOMWidth - left}px`;
  }

  eq(other: VisualBlock) {
    return this.typeName === other.typeName && this.startTop === other.startTop && this.endBottom == other.endBottom && this.depth === other.depth;
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
    this.measureReq = {read: this.readBlockInfo.bind(this), write: this.drawOverlay.bind(this)}
    this.overlayLayer = view.scrollDOM.appendChild(document.createElement("div"))
    this.overlayLayer.className = themeClass("overlayLayer")
    this.overlayLayer.setAttribute("aria-hidden", "true")
    view.requestMeasure(this.measureReq)
  }

  update(update: ViewUpdate) {
    if (update.geometryChanged || update.viewportChanged || update.docChanged) {
      this.view.requestMeasure(this.measureReq)
    }
  }

  readBlockInfo(): Measure {
    const view = this.view;
    const { visibleRanges, state } = view;
    const tree = syntaxTree(state)
    const blocks: VisualBlock[] = [];
    for (const {from, to} of visibleRanges) {
      let depth = 0;
      tree.iterate({
        from, to,
        enter: (type, _start) => {
          if (grammarInfo.compoundStatement.has(type.name)) {
            depth++;
          }
        },
        leave: (type, start, end) => {
          if (grammarInfo.compoundStatement.has(type.name)) {
            const endVisualLine = view.visualLineAt(skipTrailingBlankLines(state, end - 1))
            blocks.push(new VisualBlock(type.name, view.visualLineAt(start).top, endVisualLine.bottom, depth - 1));
            depth--;
          }
        }
      })
    }
    return { blocks };
  }

  drawOverlay({ blocks }: Measure) {
    const fixed: FixedDimensions = {
      leftEdge: this.view.contentDOM.getBoundingClientRect().left - this.view.scrollDOM.getBoundingClientRect().left,
      contentDOMWidth: this.view.contentDOM.getBoundingClientRect().width,
      indentPixelWidth: this.view.state.facet(indentUnit).length * this.view.defaultCharacterWidth
    }
    const blocksChanged = blocks.length != this.blocks.length || blocks.some((b, i) => !b.eq(this.blocks[i]));
    if (blocksChanged) {
      let oldBlocks = this.overlayLayer.children
      if (oldBlocks.length !== blocks.length) {
        this.overlayLayer.textContent = ""
        for (const b of blocks) {
          this.overlayLayer.appendChild(b.draw(fixed))
        }
      } else {
        blocks.forEach((b, idx) => b.adjust(fixed, oldBlocks[idx] as HTMLElement))
      }
      this.blocks = blocks;
    }
  }

  destroy() {
    this.overlayLayer.remove();
  }
});

const skipTrailingBlankLines = (state: EditorState, position: number) => {
  let line = state.doc.lineAt(position);
  while (line.length === 0 && line.number >= 1) {
    line = state.doc.line(line.number - 1);
  }
  return line.to;
}

const baseTheme = EditorView.baseTheme({
  $overlayLayer: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    // What about touch? Can we just put it behind?
    // If we had interactive elements we could have another layer on top.
    "pointerEvents": "none"
  },
})

export const overlay = (): Extension => [overlayView, baseTheme];
