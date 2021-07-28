import { linter, Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";
import { TPyParser } from "tigerpython-parser";

export const tygerPythonLinter = () => {
  const source = (view: EditorView): Diagnostic[] => {
    const errors = TPyParser.findAllErrors(view.state.doc.sliceString(0));
    return errors.map((error: any) => ({
      severity: "error",
      // We have an offset but hard to display clearly.
      from: view.state.doc.line(error.line + 1).from,
      to: view.state.doc.line(error.line + 1).to,
      source: "TygerPython",
      message: error.msg,
    }));
  };
  return linter(source);
};
