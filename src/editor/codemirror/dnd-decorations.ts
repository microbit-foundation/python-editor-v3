import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/rangeset";
import { StateEffect } from "@codemirror/state";

export const timeoutDropDecorationEffect = StateEffect.define<{}>({});

const dndDecorationsViewPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    previewLineFroms = new Set<number>();
    droppedRecentLineFroms = new Set<number>();
    droppedDoneLineFroms = new Set<number>();

    constructor(view: EditorView) {
      this.decorations = this.dndDecorationsForLines(view);
    }

    update(update: ViewUpdate) {
      for (const transaction of update.transactions) {
        if (
          transaction.effects.find((e) => e.is(timeoutDropDecorationEffect))
        ) {
          this.droppedDoneLineFroms.clear();
          this.droppedRecentLineFroms.forEach((v) =>
            this.droppedDoneLineFroms.add(v)
          );
          this.previewLineFroms.clear();
          this.droppedRecentLineFroms.clear();
        }
      }

      if (update.docChanged) {
        this.previewLineFroms.clear();
        this.droppedRecentLineFroms.clear();
        this.droppedDoneLineFroms.clear();
        for (const transaction of update.transactions) {
          if (transaction.isUserEvent("dnd")) {
            update.changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
              const start = update.state.doc.lineAt(fromB);
              const end = update.state.doc.lineAt(toB);
              for (let l = start.number; l < end.number; ++l) {
                const line = update.state.doc.line(l);
                if (line.text.trim()) {
                  if (transaction.isUserEvent("dnd.preview")) {
                    this.previewLineFroms.add(line.from);
                  } else if (transaction.isUserEvent("dnd.drop")) {
                    this.droppedRecentLineFroms.add(line.from);
                  }
                }
              }
            });
          }
        }

        // Later we need to flip the decoration type.
        if (update.transactions.some((t) => t.isUserEvent("dnd.drop"))) {
          setTimeout(() => {
            update.view.dispatch({
              effects: [timeoutDropDecorationEffect.of({})],
            });
          }, 2_000);
        }
      }
      this.decorations = this.dndDecorationsForLines(update.view);
    }

    dndDecorationsForLines = (view: EditorView): DecorationSet => {
      const builder = new RangeSetBuilder<Decoration>();
      for (let { from: rangeFrom, to: rangeTo } of view.visibleRanges) {
        for (let pos = rangeFrom; pos <= rangeTo; ) {
          let { from, to } = view.state.doc.lineAt(pos);
          if (this.previewLineFroms.has(from)) {
            builder.add(from, from, preview);
          } else if (this.droppedRecentLineFroms.has(from)) {
            builder.add(from, from, droppedRecent);
          } else if (this.droppedDoneLineFroms.has(from)) {
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
    backgroundColor: "#FEFCBF",
  },
  ".cm-dropped--recent": {
    backgroundColor: "#FEFCBF99",
  },
  ".cm-dropped--done": {
    transition: "background-color ease-in 1s",
  },
});

export const dndDecorations = () => [dndTheme, dndDecorationsViewPlugin];
