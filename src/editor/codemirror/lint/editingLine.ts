import { StateEffect, StateField } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

export const currentlyEditingLinePlugin = ViewPlugin.fromClass(
  class {
    timeout: any;
    prevSelectionLine: number | undefined = undefined;

    update(update: ViewUpdate) {
      if (!update.docChanged && !update.selectionSet) {
        return;
      }
      const mainIndex = update.state.selection?.asSingle()?.ranges[0]?.from;
      if (!mainIndex) {
        return undefined;
      }
      const doc = update.state.doc;
      const selectionLine = doc.lineAt(mainIndex).number;
      // Don't update if currentlyEditingLine hasn't changed.
      if (this.prevSelectionLine === selectionLine) {
        return;
      }
      update.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
        if (
          doc.lineAt(toA).number === selectionLine ||
          doc.lineAt(toB).number === selectionLine
        ) {
          // Woohoo, we changed the line we're on.
          clearTimeout(this.timeout);
          setTimeout(() => {
            this.prevSelectionLine = selectionLine;
            update.view.dispatch({
              effects: [setEditingLineEffect.of(selectionLine)],
            });
          }, 0);
          this.timeout = setTimeout(() => {
            this.prevSelectionLine = undefined;
            update.view.dispatch({
              effects: [setEditingLineEffect.of(undefined)],
            });
          }, 2000);
        }
      });
    }

    destroy() {
      clearTimeout(this.timeout);
    }
  }
);

export const setEditingLineEffect = StateEffect.define<number | undefined>();

export const currentlyEditingLine = StateField.define<number | undefined>({
  create() {
    return undefined;
  },
  update(line, tr) {
    for (let effect of tr.effects) {
      if (effect.is(setEditingLineEffect)) {
        return effect.value;
      }
    }
    return line;
  },
});
