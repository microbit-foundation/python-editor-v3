/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { deployment } from "../../deployment";
import { CodeInsertType } from "./dnd";
import { calculateChanges } from "./edits";

export interface PasteContext {
  code: string;
  codeWithImports: string;
  type: CodeInsertType;
  id?: string;
}

let pasteContext: PasteContext | undefined;

/**
 * Set the copied code snippet.
 *
 * We can't represent it on the clipboard as FF doesn't yet support ClipboardItem.
 */
export const copyCodeSnippet = (context: PasteContext | undefined) => {
  pasteContext = context;
};

const copyPasteHandlers = () => [
  EditorView.domEventHandlers({
    paste(event, view) {
      if (!view.state.facet(EditorView.editable)) {
        return;
      }
      if (!pasteContext) {
        return;
      }

      if (
        event.clipboardData?.getData("text").replace(/\r\n/g, "\n") !==
        pasteContext.code
      ) {
        // Must have happened since the code snippet copy.
        pasteContext = undefined;
        return;
      }
      event.preventDefault();
      deployment.logging.event({
        type: "code-paste",
        message: pasteContext.id,
      });

      const line = view.state.doc.lineAt(view.state.selection.ranges[0].from);
      const lineNumber = line.number;
      const column = view.state.selection.ranges[0].from - line.from;

      view.dispatch(
        calculateChanges(
          view.state,
          pasteContext.codeWithImports,
          pasteContext.type,
          lineNumber,
          Math.floor(column / 4),
          true
        )
      );
      view.focus();
    },
  }),
];

export const copyPasteSupport = (): Extension => [copyPasteHandlers()];
