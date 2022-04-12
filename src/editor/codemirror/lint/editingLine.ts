import { StateEffect, StateField } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

export const currentlyEditingLinePlugin = ViewPlugin.fromClass(
  class {
    timeout: any;

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
      let foundEditOnLine = false;
      update.changes.iterChangedRanges((_fromA, _toA, fromB, _toB) => {
        if (!foundEditOnLine && doc.lineAt(fromB).number === selectionLine) {
          foundEditOnLine = true;
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
          }, 2_000);
        }
      });
      if (
        !foundEditOnLine &&
        update.state.field(currentlyEditingLine) !== selectionLine
      ) {
        clearTimeout(this.timeout);
        setTimeout(() => {
          update.view.dispatch({
            effects: [setEditingLineEffect.of(undefined)],
          });
        }, 0);
      }
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
