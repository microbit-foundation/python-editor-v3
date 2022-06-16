import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { deployment } from "../../deployment";
import { CodeInsertType } from "./dnd";
import { calculateChanges } from "./edits";

interface PasteContext {
  code: string;
  type: CodeInsertType;
  id?: string;
}

const getCodeFromHtml = (
  stringHTML: string | undefined
): PasteContext | undefined => {
  if (!stringHTML) {
    return;
  }
  const docFromHTML = new DOMParser().parseFromString(stringHTML, "text/html");
  const code = docFromHTML.querySelector("code")?.textContent || "";
  const type = docFromHTML
    .querySelector("code")
    ?.getAttribute("data-type") as CodeInsertType;
  const id = docFromHTML
    .querySelector("code")
    ?.getAttribute("data-id") as CodeInsertType;
  if (code && type) {
    return { code, type, id };
  }
};

const copyPasteHandlers = () => [
  EditorView.domEventHandlers({
    paste(event, view) {
      if (
        !view.state.facet(EditorView.editable) ||
        event.clipboardData?.getData("text")
      ) {
        return;
      }
      const pasteContext = getCodeFromHtml(
        event.clipboardData?.getData("text/html")
      );
      if (!pasteContext) {
        return;
      }
      event.preventDefault();
      deployment.logging.event({
        type: "code-paste",
        message: pasteContext.id,
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

export const copyPasteSupport = (): Extension => [copyPasteHandlers()];
