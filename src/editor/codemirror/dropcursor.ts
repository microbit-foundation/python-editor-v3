/**
 * MIT License
 *
 * Copyright (C) 2018-2021 by Marijn Haverbeke <marijnh@gmail.com> and others
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Edited from https://github.com/codemirror/view/blob/main/src/dropcursor.ts
 */

import { StateField, StateEffect, Extension } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { pythonSnippetMediaType } from "../../common/mediaTypes";

interface MeasureRequest<T> {
  /// Called in a DOM read phase to gather information that requires
  /// DOM layout. Should _not_ mutate the document.
  read(view: EditorView): T;
  /// Called in a DOM write phase to update the document. Should _not_
  /// do anything that triggers DOM layout.
  write?(measure: T, view: EditorView): void;
  /// When multiple requests with the same key are scheduled, only the
  /// last one will actually be ran.
  key?: any;
}

const setDropCursorPos = StateEffect.define<number | null>({
  map(pos, mapping) {
    return pos == null ? null : mapping.mapPos(pos);
  },
});

const dropCursorPos = StateField.define<number | null>({
  create() {
    return null;
  },
  update(pos, tr) {
    if (pos != null) pos = tr.changes.mapPos(pos);
    return tr.effects.reduce(
      (pos, e) => (e.is(setDropCursorPos) ? e.value : pos),
      pos
    );
  },
});

const drawDropCursor = ViewPlugin.fromClass(
  class {
    cursor: HTMLElement | null = null;
    measureReq: MeasureRequest<{
      left: number;
      top: number;
      height: number;
    } | null>;

    constructor(readonly view: EditorView) {
      this.measureReq = {
        read: this.readPos.bind(this),
        write: this.drawCursor.bind(this),
      };
    }

    update(update: ViewUpdate) {
      let cursorPos = update.state.field(dropCursorPos);
      if (cursorPos == null) {
        if (this.cursor != null) {
          this.cursor?.remove();
          this.cursor = null;
        }
      } else {
        if (!this.cursor) {
          this.cursor = this.view.scrollDOM.appendChild(
            document.createElement("div")
          );
          this.cursor!.className = "cm-dropCursor";
        }
        if (
          update.startState.field(dropCursorPos) !== cursorPos ||
          update.docChanged ||
          update.geometryChanged
        )
          this.view.requestMeasure(this.measureReq);
      }
    }

    readPos(): { left: number; top: number; height: number } | null {
      let pos = this.view.state.field(dropCursorPos);
      let rect = pos != null && this.view.coordsAtPos(pos);
      if (!rect) return null;
      let outer = this.view.scrollDOM.getBoundingClientRect();
      return {
        left: rect.left - outer.left + this.view.scrollDOM.scrollLeft,
        top: rect.top - outer.top + this.view.scrollDOM.scrollTop,
        height: rect.bottom - rect.top,
      };
    }

    drawCursor(pos: { left: number; top: number; height: number } | null) {
      if (this.cursor) {
        if (pos) {
          this.cursor.style.left = pos.left + "px";
          this.cursor.style.top = pos.top + "px";
          this.cursor.style.height = pos.height + "px";
        } else {
          this.cursor.style.left = "-100000px";
        }
      }
    }

    destroy() {
      if (this.cursor) this.cursor.remove();
    }

    setDropPos(pos: number | null) {
      if (this.view.state.field(dropCursorPos) !== pos)
        this.view.dispatch({ effects: setDropCursorPos.of(pos) });
    }
  },
  {
    eventHandlers: {
      dragover(event) {
        // Avoid setting drop position if dragged element is a code snippet/example.
        if (!event.dataTransfer?.types.includes(pythonSnippetMediaType)) {
          this.setDropPos(
            this.view.posAtCoords({ x: event.clientX, y: event.clientY })
          );
        }
      },
      dragleave(event) {
        if (
          event.target === this.view.contentDOM ||
          !this.view.contentDOM.contains(event.relatedTarget as HTMLElement)
        )
          this.setDropPos(null);
      },
      dragend() {
        this.setDropPos(null);
      },
      drop() {
        this.setDropPos(null);
      },
    },
  }
);

/// Draws a cursor at the current drop position when something is
/// dragged over the editor.
export function dropCursor(): Extension {
  return [dropCursorPos, drawDropCursor];
}
