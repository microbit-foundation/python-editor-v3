import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { StateEffect } from "@codemirror/state";

export const timeoutEffect = StateEffect.define<{}>({});

const dndDecorationsViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    previewPos = new Set<number>();
    droppedReceptPos = new Set<number>();
    droppedDonePos = new Set<number>();

    constructor(view: EditorView) {
      this.decorations = this.dndDecorationsForLines(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged) {
        this.previewPos.clear();
        this.droppedReceptPos.clear();
        this.droppedDonePos.clear();
        for (const transaction of update.transactions) {
          const isPreview = transaction.isUserEvent("dnd.preview");
          const isDrop = transaction.isUserEvent("dnd.drop");
          if (isPreview || isDrop) {
            update.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
              const start = update.state.doc.lineAt(fromB);
              const end = update.state.doc.lineAt(toB);
              for (let l = start.number; l < end.number; ++l) {
                const line = update.state.doc.line(l);
                if (line.text.trim()) {
                  if (isPreview) {
                    this.previewPos.add(line.from);
                  } else if (isDrop) {
                    this.droppedReceptPos.add(line.from);
                  }
                }
              }
            });
          }
        }

        // Later we need to flip the decoration type to fade the highlighting.
        // The "done" decoration will be removed by a future document change.
        if (update.transactions.some((t) => t.isUserEvent("dnd.drop"))) {
          setTimeout(() => {
            update.view.dispatch({
              effects: [timeoutEffect.of({})],
            });
          }, 2_000);
        }
      } else {
        for (const transaction of update.transactions) {
          if (transaction.effects.find((e) => e.is(timeoutEffect))) {
            this.droppedDonePos = this.droppedReceptPos;
            this.droppedReceptPos = new Set();
            this.previewPos.clear();
          }
        }
      }
      this.decorations = this.dndDecorationsForLines(update.view);
    }

    dndDecorationsForLines = (view: EditorView): DecorationSet => {
      const builder = new RangeSetBuilder<Decoration>();
      for (let { from: rangeFrom, to: rangeTo } of view.visibleRanges) {
        for (let pos = rangeFrom; pos <= rangeTo; ) {
          let { from, to } = view.state.doc.lineAt(pos);
          if (this.previewPos.has(from)) {
            builder.add(from, from, preview);
          } else if (this.droppedReceptPos.has(from)) {
            builder.add(from, from, droppedRecent);
          } else if (this.droppedDonePos.has(from)) {
            builder.add(from, from, droppedDone);
          }
          pos = to + 1;
        }
      }
      return builder.finish();
    };
  },
  {
    decorations: (v) => v.decorations,
  }
);

const preview = Decoration.line({
  attributes: { class: "cm-preview" },
});

const droppedRecent = Decoration.line({
  attributes: { class: "cm-dropped--recent" },
});

const droppedDone = Decoration.line({
  attributes: { class: "cm-dropped--done" },
});

const dndTheme = EditorView.theme({
  ".cm-preview": {
    backgroundColor: "#fefcbfdd",
  },
  ".cm-dropped--recent": {
    backgroundColor: "#fefcbf99",
  },
  ".cm-dropped--done": {
    transition: "background-color ease-in 1s",
  },
});

export const dndDecorations = () => [dndTheme, dndDecorationsViewPlugin];
