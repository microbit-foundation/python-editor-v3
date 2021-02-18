/**
 * A CoreMirror view extension providing structural highlighting using
 * CodeMirror's syntax tree.
 */
import { indentUnit, syntaxTree } from "@codemirror/language";
import {
  EditorView,
  themeClass,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { EditorState, Extension } from "@codemirror/state";

// Names from https://github.com/lezer-parser/python/blob/master/src/python.grammar
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

class VisualBlock {
  constructor(
    readonly name: string,
    readonly left: number,
    readonly top: number,
    readonly width: number,
    readonly height: number
  ) {}

  draw() {
    const elt = document.createElement("div");
    elt.className = themeClass("block");
    const nameSpan = elt.appendChild(document.createElement("span"));
    nameSpan.className = themeClass("blockName");
    nameSpan.textContent = this.name.replace(/Definition$|Statement$/, "");
    this.adjust(elt);
    return elt;
  }

  adjust(elt: HTMLElement) {
    elt.style.left = this.left + "px";
    elt.style.top = this.top + "px";
    elt.style.width = this.width + "px";
    elt.style.height = this.height + "px";
  }

  eq(other: VisualBlock) {
    return (
      this.left == other.left &&
      this.top == other.top &&
      this.width == other.width &&
      this.height == other.height
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
      this.overlayLayer.className = themeClass("blockLayer");
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
      const contentDOMWidth = view.contentDOM.getBoundingClientRect().width;
      const indentWidth =
        state.facet(indentUnit).length * view.defaultCharacterWidth;

      const blocks: VisualBlock[] = [];
      // We could throw away blocks if we tracked returning to the top-level or started from
      // the closest top-level node. Otherwise we need to render them because they overlap.
      // Should consider switching to tree cursors to avoid allocating syntax nodes.
      let depth = 0;
      const tree = syntaxTree(state);
      if (tree) {
        tree.iterate({
          enter: (type, _start) => {
            if (grammarInfo.compoundStatements.has(type.name)) {
              depth++;
            }
          },
          leave: (type, start, end) => {
            if (grammarInfo.compoundStatements.has(type.name)) {
              const top = view.visualLineAt(start).top;
              const bottom = view.visualLineAt(
                skipTrailingBlankLines(state, end - 1)
              ).bottom;
              const height = bottom - top;
              const leftIndent = (depth - 1) * indentWidth;
              const left = leftEdge + leftIndent;
              const width = contentDOMWidth - leftIndent;
              blocks.push(new VisualBlock(type.name, left, top, width, height));
              depth--;
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
          this.overlayLayer.appendChild(b.draw());
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
  $blockLayer: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    // Coult also try this rather than z-index but seems more scary.
    // pointerEvents: "none",
    zIndex: -1,
  },
  $block: {
    display: "block",
    position: "absolute",
    backgroundColor: "rgba(52,162,235, 0.06)",
    // For debug text, which we'll probably remove.
    color: "lightgrey",
    textAlign: "right",
  },
  $blockName: {
    paddingRight: "5px",
  },
});

export const blocks = (): Extension => [blocksView, baseTheme];
