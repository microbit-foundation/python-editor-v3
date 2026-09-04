/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChangeSet, Extension, Transaction } from "@codemirror/state";
import { EditorView, ViewPlugin, ViewUpdate } from "@codemirror/view";
import { deployment } from "../../deployment";
import { flags } from "../../flags";
import { SessionSettings } from "../../settings/session-settings";
import { dndDecorations } from "./dnd-decorations";
import "./dnd.css";
import { calculateChanges } from "./edits";

export const debug = (message: string, ...args: any) => {
  if (flags.dndDebug) {
    console.log(message, ...args);
  }
};

/**
 * Information stashed last time we handled dragover.
 * Cleared on drop, dragleave or when the drag ends.
 */
interface LastDragPos {
  /**
   * The last drag position.
   */
  logicalPosition: LogicalPosition;
  /**
   * The inverse set of changes to the changes made for preview.
   */
  previewUndo: ChangeSet;
}

interface LogicalPosition {
  line: number;
  indent: number | undefined;
}

export type CodeInsertType =
  /**
   * A potentially multi-line example snippet.
   */
  | "example"
  /**
   * A function call.
   */
  | "call";

export interface DragContext {
  code: string;
  type: CodeInsertType;
  id?: string;
}

let dragContext: DragContext | undefined;

/**
 * Cleanup for the editor showing a preview for the current drag.
 *
 * The editor only sees dragleave/drop when the pointer leaves or drops on
 * its content, so a drag cancelled or dropped elsewhere would otherwise
 * leave the preview in the document and stale undo state behind.
 */
let endDragInEditor: (() => void) | undefined;

/**
 * Set the dragged code.
 *
 * There's no access to the content via the event in dragover (as it may be cross-document),
 * we use that event to draw a preview, so we need shared state with the drag.
 *
 * Set it in dragstart and clear it in dragend.
 */
export const setDragContext = (context: DragContext | undefined) => {
  dragContext = context;
  if (!context) {
    endDragInEditor?.();
    endDragInEditor = undefined;
  }
};

// We add the class to the parent element that we own as otherwise CM
// will remove it when it re-renders. Might be worth replacing this
// with a CM compartment with the style.
const findWrappingSection = (view: EditorView) => {
  let e: HTMLElement | null = view.contentDOM;
  while (e && e.localName !== "section") {
    e = e.parentElement;
  }
  if (!e) {
    throw new Error("Unexpected DOM structure");
  }
  return e;
};

const suppressChildDragEnterLeave = (view: EditorView) => {
  findWrappingSection(view).classList.add("cm-drag-in-progress");
};

const clearSuppressChildDragEnterLeave = (view: EditorView) => {
  findWrappingSection(view).classList.remove("cm-drag-in-progress");
};

const dndHandlers = ({ sessionSettings, setSessionSettings }: DragTracker) =>
  ViewPlugin.fromClass(
    class {
      private lastDragPos: LastDragPos | undefined;

      constructor(private view: EditorView) {}

      update(update: ViewUpdate) {
        // Keep the undo applicable if something else changes the document
        // while the preview is showing.
        if (
          this.lastDragPos &&
          update.docChanged &&
          !update.transactions.some((t) => t.isUserEvent("dnd"))
        ) {
          this.lastDragPos.previewUndo = this.lastDragPos.previewUndo.map(
            update.changes
          );
        }
      }

      destroy() {
        if (endDragInEditor === this.endDrag) {
          endDragInEditor = undefined;
        }
      }

      private startDrag() {
        suppressChildDragEnterLeave(this.view);
        endDragInEditor = this.endDrag;
      }

      private endDrag = () => {
        clearSuppressChildDragEnterLeave(this.view);
        this.revertPreview();
      };

      private revertPreview() {
        const lastDragPos = this.lastDragPos;
        // Clear first so a failure here cannot break every later drag.
        this.lastDragPos = undefined;
        if (!lastDragPos) {
          return;
        }
        const { previewUndo } = lastDragPos;
        if (previewUndo.length !== this.view.state.doc.length) {
          debug("  revertPreview skipped, document changed", {
            expected: previewUndo.length,
            actual: this.view.state.doc.length,
          });
          return;
        }
        this.view.dispatch({
          userEvent: "dnd.cleanup",
          changes: previewUndo,
          annotations: [Transaction.addToHistory.of(false)],
        });
      }

      dragover(event: DragEvent) {
        const view = this.view;
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        event.preventDefault();

        const logicalPosition = findLogicalPosition(view, event);
        if (
          logicalPosition.line !== this.lastDragPos?.logicalPosition.line ||
          logicalPosition.indent !== this.lastDragPos?.logicalPosition.indent
        ) {
          debug("  dragover", logicalPosition);
          this.revertPreview();
          this.startDrag();

          const transaction = calculateChanges(
            view.state,
            dragContext.code,
            dragContext.type,
            logicalPosition.line,
            logicalPosition.indent
          );
          this.lastDragPos = {
            logicalPosition,
            previewUndo: transaction.changes.invert(view.state.doc),
          };
          // Take just the changes, skip the selection updates we perform on drop.
          view.dispatch({
            userEvent: "dnd.preview",
            changes: transaction.changes,
            annotations: [Transaction.addToHistory.of(false)],
          });
        }
      }

      dragenter(event: DragEvent) {
        if (!this.view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        debug("dragenter");
        event.preventDefault();
        this.startDrag();
      }

      dragleave(event: DragEvent) {
        const view = this.view;
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }

        if (event.target === view.contentDOM) {
          event.preventDefault();
          this.endDrag();
          debug(
            "  dragleave",
            {
              x: event.clientX,
              y: event.clientY,
            },
            event.target
          );
        } else {
          debug(
            "  dragleave (ignored)",
            {
              x: event.clientX,
              y: event.clientY,
            },
            event.target
          );
        }
      }

      drop(event: DragEvent) {
        const view = this.view;
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        deployment.logging.event({
          type: "code-drop",
          message: dragContext.id,
        });
        if (!sessionSettings.dragDropSuccess) {
          setSessionSettings({
            ...sessionSettings,
            dragDropSuccess: true,
          });
        }
        debug("  drop");
        event.preventDefault();

        const logicalPosition = findLogicalPosition(view, event);
        this.endDrag();
        view.dispatch(
          calculateChanges(
            view.state,
            dragContext.code,
            dragContext.type,
            logicalPosition.line,
            logicalPosition.indent,
            false
          )
        );
        view.focus();
      }
    },
    {
      eventHandlers: {
        dragover(event) {
          this.dragover(event);
        },
        dragenter(event) {
          this.dragenter(event);
        },
        dragleave(event) {
          this.dragleave(event);
        },
        drop(event) {
          this.drop(event);
        },
      },
    }
  );

const findLogicalPosition = (
  view: EditorView,
  event: DragEvent
): { line: number; indent: number | undefined } => {
  const height = (event.y || event.clientY) - view.documentTop;
  const visualLine = view.lineBlockAtHeight(height);
  const line = view.state.doc.lineAt(visualLine.from);
  const pos = view.posAtCoords({
    x: event.x || event.clientX,
    y: event.y || event.clientY,
  });
  const column = pos !== null ? pos - visualLine.from : undefined;
  const indent = column !== undefined ? Math.floor(column / 4) : undefined;
  return {
    line: line.number,
    indent,
  };
};

interface DragTracker {
  sessionSettings: SessionSettings;
  setSessionSettings: (sessionSettings: SessionSettings) => void;
}

/**
 * Support for dropping code snippets.
 *
 * Note this requires coordination from the drag end via {@link setDraggedCode}.
 */
export const dndSupport = (dragTracker: DragTracker): Extension => [
  dndHandlers(dragTracker),
  dndDecorations(),
];
