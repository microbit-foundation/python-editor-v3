import { syntaxTree } from "@codemirror/language"
import { BlockInfo, EditorView, themeClass, ViewPlugin, ViewUpdate } from "@codemirror/view"
import { Extension } from "@codemirror/state";

interface VisualBlock {
  typeName: string;
  start: BlockInfo;
  end: BlockInfo;
}

interface Measure {
  blocks: VisualBlock[];
}

const overlayView = ViewPlugin.fromClass(class {
  measureReq: {read: () => Measure, write: (value: Measure) => void}
  overlayLayer: HTMLElement

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
      tree.iterate({
        from, to,
        enter: (_type, _start) => {},
        leave: (type, start, end) => {
          if (type.name === "WhileStatement") {
            blocks.push({
              typeName: type.name,
              start: view.visualLineAt(start),
              end: view.visualLineAt(end)
            })
          }
        }
      })
    }
    return { blocks };
  }

  drawOverlay({ blocks }: Measure) {
    this.overlayLayer.textContent = ""
    for (const block of blocks) {
      const span = document.createElement("span");
      span.style.left = "0";
      span.style.top = `${block.start.top}px`;
      span.style.height = `${block.end.top + block.end.height - block.start.top}px`;
      span.style.width = "100%";
      span.style.display = "block";
      span.style.backgroundColor = "blue";
      span.style.opacity = "50%";
      this.overlayLayer.appendChild(span);
    }
  }

  destroy() {
    this.overlayLayer.remove();
  }
});

const baseTheme = EditorView.baseTheme({
  $overlayLayer: {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    "pointerEvents": "none"
  },
})

export const overlay = (): Extension => [overlayView, baseTheme];
