import { Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { lineNumFromUint8Array } from "../../common/text-util";
import { deployment } from "../../deployment";
import { calculateChanges } from "./edits";

const copyPasteHandlers = () => {
  const textEncoder = new TextEncoder();
  return [
    EditorView.domEventHandlers({
      paste(event, view) {
        if (!view.state.facet(EditorView.editable)) {
          return;
        }
        event.preventDefault();

        const code = event.clipboardData?.getData("text") || "";

        // Should we use lineCount here, or follow the dnd logging?
        // If we use lineCount, should we ignore imports and empty lines?
        const lineCount = lineNumFromUint8Array(
          // Ignore leading/trailing lines.
          textEncoder.encode(code.trim())
        );
        deployment.logging.event({
          type: "paste",
          value: lineCount,
        });

        const lineNumber = view.state.doc.lineAt(
          view.state.selection.ranges[0].from
        ).number;

        view.dispatch(
          calculateChanges(view.state, code, "unknown", lineNumber)
        );
        view.focus();
      },
    }),
  ];
};

export const copyPasteSupport = (): Extension => [copyPasteHandlers()];
