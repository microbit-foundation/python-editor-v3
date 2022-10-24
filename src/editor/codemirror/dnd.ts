/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { ChangeSet, Extension, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
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
 * Cleared on drop or dragleave.
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
 * Set the dragged code.
 *
 * There's no access to the content via the event in dragover (as it may be cross-document),
 * we use that event to draw a preview, so we need shared state with the drag.
 *
 * Set it in dragstart and clear it in dragend.
 */
export const setDragContext = (context: DragContext | undefined) => {
  dragContext = context;
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

const dndHandlers = ({ sessionSettings, setSessionSettings }: DragTracker) => {
  let lastDragPos: LastDragPos | undefined;

  const revertPreview = (view: EditorView) => {
    if (lastDragPos) {
      view.dispatch({
        userEvent: "dnd.cleanup",
        changes: lastDragPos.previewUndo,
        annotations: [Transaction.addToHistory.of(false)],
      });
      lastDragPos = undefined;
    }
  };

  return [
    EditorView.domEventHandlers({
      dragover(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }

        if (dragContext) {
          event.preventDefault();

          const logicalPosition = findLogicalPosition(view, event);
          if (
            logicalPosition.line !== lastDragPos?.logicalPosition.line ||
            logicalPosition.indent !== lastDragPos?.logicalPosition.indent
          ) {
            debug("  dragover", logicalPosition);
            revertPreview(view);

            const transaction = calculateChanges(
              view.state,
              dragContext.code,
              dragContext.type,
              logicalPosition.line,
              logicalPosition.indent
            );
            lastDragPos = {
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
      },
      dragenter(event, view) {
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }
        debug("dragenter");
        event.preventDefault();
        suppressChildDragEnterLeave(view);
      },
      dragleave(event, view) {
        if (!view.state.facet(EditorView.editable) || !dragContext) {
          return;
        }

        if (event.target === view.contentDOM) {
          event.preventDefault();
          clearSuppressChildDragEnterLeave(view);
          revertPreview(view);
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
      },
      drop(event, view) {
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
        clearSuppressChildDragEnterLeave(view);
        event.preventDefault();

        const logicalPosition = findLogicalPosition(view, event);
        revertPreview(view);
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
      },
    }),
  ];
};

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
