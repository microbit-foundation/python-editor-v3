import { StateEffect, StateField } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

export const currentlyEditingLinePlugin = ViewPlugin.fromClass(
  class {
    timeout: any;

    update(update: ViewUpdate) {
      if (!update.docChanged && !update.selectionSet) {
        return;
      }
      console.log("Here2");
      const mainIndex = update.state.selection?.asSingle()?.ranges[0]?.from;
      console.log(update.state.selection);
      if (!mainIndex) {
        return undefined;
      }
      console.log({ mainIndex });
      const doc = update.state.doc;
      const selectionLine = doc.lineAt(mainIndex).number;
      update.changes.iterChangedRanges((fromA, toA, fromB, toB) => {
        if (doc.lineAt(toA).number === selectionLine) {
          // Woohoo, we changed the line we're on.
          clearTimeout(this.timeout);
          setTimeout(() => {
            update.view.dispatch({
              effects: [setEditingLineEffect.of(selectionLine)],
            });
          }, 0);
          this.timeout = setTimeout(() => {
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
