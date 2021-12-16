import { ChangeSet, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { flags } from "../../flags";
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
  line: number;
  /**
   * The inverse set of changes to the changes made for preview.
   */
  previewUndo: ChangeSet;
}

let draggedCode: string | undefined;

/**
 * Set the dragged code.
 *
 * There's no access to the content via the event in dragover (as it may be cross-document),
 * we use that event to draw a preview, so we need shared state with the drag.
 *
 * Set it in dragstart and clear it in dragend.
 */
export const setDraggedCode = (value: string | undefined) => {
  draggedCode = value;
};

/**
 * Support for dropping code snippets.
 *
 * Note this requires coordination from the drag end via {@link setDraggedCode}.
 */
export const dndSupport = () => {
  let lastDragPos: LastDragPos | undefined;
  const revertPreview = (view: EditorView) => {
    if (lastDragPos) {
      view.dispatch({
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

        if (draggedCode) {
          event.preventDefault();

          const visualLine = view.visualLineAtHeight(event.y);
          const line = view.state.doc.lineAt(visualLine.from);

          if (line.number !== lastDragPos?.line) {
            debug("  dragover", line);
            revertPreview(view);

            const transaction = calculateChanges(
              view.state,
              draggedCode,
              line.number
            );
            lastDragPos = {
              line: line.number,
              previewUndo: transaction.changes.invert(view.state.doc),
            };
            // Take just the changes, skip the selection updates we perform on drop.
            view.dispatch({
              changes: transaction.changes,
              annotations: [Transaction.addToHistory.of(false)],
            });
          }
        }
      },
      dragleave(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }

        if (draggedCode) {
          event.preventDefault();

          // dragenter and leave are fired for the child elements of the view too.
          const rect = view.contentDOM.getBoundingClientRect();
          if (
            event.clientY < rect.top ||
            event.clientY >= rect.bottom ||
            event.clientX < rect.left ||
            event.clientX >= rect.right
          ) {
            debug(
              "  dragleave",
              rect,
              {
                x: event.clientX,
                y: event.clientY,
              },
              event.target
            );
            revertPreview(view);
          } else {
            debug(
              "  dragleave (ignored)",
              rect,
              {
                x: event.clientX,
                y: event.clientY,
              },
              event.target
            );
          }
        }
      },
      drop(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }

        const draggedCode = event.dataTransfer?.getData(pythonSnippetMediaType);
        if (draggedCode) {
          debug("  drop");
          event.preventDefault();

          const visualLine = view.visualLineAtHeight(event.y);
          const line = view.state.doc.lineAt(visualLine.from);

          revertPreview(view);
          view.dispatch(calculateChanges(view.state, draggedCode, line.number));
          view.focus();
        }
      },
    }),
  ];
};
