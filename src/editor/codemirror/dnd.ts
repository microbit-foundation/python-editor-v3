import { ChangeSet, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { pythonSnippetMediaType } from "../../common/mediaTypes";
import { calculateChanges } from "./edits";

/**
 * Information stashed last time we handled dragover.
 * Cleared on drop of dragleave.
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

let lastDragPos: LastDragPos | undefined;

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
  lastDragPos = undefined;
};

const revertPreview = (view: EditorView) => {
  if (lastDragPos) {
    view.dispatch({
      changes: lastDragPos.previewUndo,
      annotations: [Transaction.addToHistory.of(false)],
    });
    lastDragPos = undefined;
  }
};

/**
 * Support for dropping snippets.
 *
 * Note this requires coordination from the drag end via {@link setDraggedCode}.
 */
export const dndSupport = () => {
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

        const isChildElement = (event.currentTarget as Node).contains(
          event.relatedTarget as Node
        );
        if (isChildElement) {
          // Skip dragleave events for child elements as we're still dragging over the editor.
          return;
        }

        if (draggedCode) {
          event.preventDefault();

          revertPreview(view);
        }
      },
      drop(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }

        const draggedCode = event.dataTransfer?.getData(pythonSnippetMediaType);
        if (draggedCode) {
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
