import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { lineNumFromUint8Array } from "../../common/text-util";
import { deployment } from "../../deployment";
import { CodeInsertType } from "./dnd";
import { calculateChanges } from "./edits";

interface PasteContext {
  code: string;
  type: CodeInsertType;
}

const getCodeFromHtml = (
  stringHTML: string | undefined
): PasteContext | undefined => {
  if (!stringHTML) {
    return;
  }
  const docFromHTML = new DOMParser().parseFromString(stringHTML, "text/html");
  return {
    code: docFromHTML.querySelector("code")?.textContent || "",
    type: docFromHTML
      .querySelector("code")
      ?.getAttribute("data-type") as CodeInsertType,
  };
};

const copyPasteHandlers = () => {
  const textEncoder = new TextEncoder();
  return [
    EditorView.domEventHandlers({
      paste(event, view) {
        if (
          !view.state.facet(EditorView.editable) ||
          event.clipboardData?.getData("text")
        ) {
          return;
        }
        event.preventDefault();
        const pasteContext = getCodeFromHtml(
          event.clipboardData?.getData("text/html")
        );
        if (!pasteContext) {
          return;
        }
        // Should we use lineCount here, or follow the dnd logging?
        // If we use lineCount, should we ignore imports and empty lines?
        const lineCount = lineNumFromUint8Array(
          // Ignore leading/trailing lines.
          textEncoder.encode(pasteContext.code.trim())
        );
        deployment.logging.event({
          type: "paste",
          value: lineCount,
        });

        const lineNumber = view.state.doc.lineAt(
          view.state.selection.ranges[0].from
        ).number;

        view.dispatch(
          calculateChanges(
            view.state,
            pasteContext.code,
            pasteContext.type,
            lineNumber,
            true
          )
        );
        view.focus();
      },
    }),
  ];
};

export const copyPasteSupport = (): Extension => [copyPasteHandlers()];
