/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { RangeSetBuilder, StateEffect } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";

export const timeoutEffect = StateEffect.define<Record<string, never>>({});

// Exported for unit testing.
export class DndDecorationsViewPlugin {
  decorations: DecorationSet;
  previewPos = new Set<number>();
  droppedRecentPos = new Set<number>();
  droppedDonePos = new Set<number>();

  constructor(view: EditorView, private timeout: number = 100) {
    this.decorations = this.dndDecorationsForLines(view);
  }

  update({ docChanged, transactions, changes, state, view }: ViewUpdate) {
    if (docChanged) {
      this.previewPos.clear();
      this.droppedRecentPos.clear();
      this.droppedDonePos.clear();

      const isPreview = transactions.some((t) => t.isUserEvent("dnd.preview"));
      const isDrop = transactions.some((t) => t.isUserEvent("dnd.drop"));
      if (isPreview || isDrop) {
        changes.iterChangedRanges((_fromA, _toA, fromB, toB) => {
          let start = state.doc.lineAt(fromB);
          // If there was no blank line at the end then the insertion will have
          // started from the EOL but doesn't make sense to highlight that line.
          if (start.to === fromB) {
            start = state.doc.lineAt(fromB + 1);
          }
          const end = state.doc.lineAt(toB);
          for (let l = start.number; l < end.number; ++l) {
            const line = state.doc.line(l);
            if (line.text.trim()) {
              if (isPreview) {
                this.previewPos.add(line.from);
              } else if (isDrop) {
                this.droppedRecentPos.add(line.from);
              }
            }
          }
        });
      }

      // Later we need to flip the decoration type to fade the highlighting.
      // The "done" decoration will be removed by a future document change.
      if (transactions.some((t) => t.isUserEvent("dnd.drop"))) {
        setTimeout(() => {
          view.dispatch({
            effects: [timeoutEffect.of({})],
          });
        }, this.timeout);
      }
    } else {
      for (const transaction of transactions) {
        if (transaction.effects.find((e) => e.is(timeoutEffect))) {
          this.droppedDonePos = this.droppedRecentPos;
          this.droppedRecentPos = new Set();
        }
      }
    }
    this.decorations = this.dndDecorationsForLines(view);
  }

  dndDecorationsForLines = (view: EditorView): DecorationSet => {
    const builder = new RangeSetBuilder<Decoration>();
    for (let { from: rangeFrom, to: rangeTo } of view.visibleRanges) {
      for (let pos = rangeFrom; pos <= rangeTo; ) {
        let { from, to } = view.state.doc.lineAt(pos);
        if (this.previewPos.has(from)) {
          builder.add(from, from, preview);
        } else if (this.droppedRecentPos.has(from)) {
          builder.add(from, from, droppedRecent);
        } else if (this.droppedDonePos.has(from)) {
          builder.add(from, from, droppedDone);
        }
        pos = to + 1;
      }
    }
    return builder.finish();
  };
}

const preview = Decoration.line({
  attributes: { class: "cm-preview" },
});

const droppedRecent = Decoration.line({
  attributes: { class: "cm-dropped--recent" },
});

const droppedDone = Decoration.line({
  attributes: { class: "cm-dropped--done" },
});

const baseColor = "#f7febf";

export const dndDecorations = () => [
  EditorView.theme({
    ".cm-preview": {
      backgroundColor: `${baseColor}55`,
    },
    ".cm-dropped--recent": {
      backgroundColor: `${baseColor}dd`,
    },
    ".cm-dropped--done": {
      transition: "background-color ease-in 2.9s",
    },
  }),
  ViewPlugin.fromClass(DndDecorationsViewPlugin, {
    decorations: (v) => v.decorations,
  }),
];
