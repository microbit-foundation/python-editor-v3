/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StateEffect, StateField } from "@codemirror/state";
import { ViewPlugin, ViewUpdate } from "@codemirror/view";

/**
 * Delay after which we no longer count a line as being edited even if the
 * cursor is still on it.
 */
const editingTimeout = 5_000;

/**
 * Plugin that maintains state tracking the line being edited.
 */
export const editingLinePlugin = ViewPlugin.fromClass(
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
          queueMicrotask(() => {
            update.view.dispatch({
              effects: [setEditingLineEffect.of(selectionLine)],
            });
          });
          this.timeout = setTimeout(() => {
            update.view.dispatch({
              effects: [setEditingLineEffect.of(undefined)],
            });
          }, editingTimeout);
        }
      });
      if (
        !foundEditOnLine &&
        update.state.field(editingLineState) !== selectionLine
      ) {
        clearTimeout(this.timeout);
        queueMicrotask(() => {
          update.view.dispatch({
            effects: [setEditingLineEffect.of(undefined)],
          });
        });
      }
    }

    destroy() {
      clearTimeout(this.timeout);
    }
  }
);

/**
 * Effect when the currently edited line is changed.
 */
export const setEditingLineEffect = StateEffect.define<number | undefined>();

/**
 * State tracking currently edited line.
 */
export const editingLineState = StateField.define<number | undefined>({
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
