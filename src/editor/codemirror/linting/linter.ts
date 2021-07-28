import { linter, Diagnostic } from "@codemirror/lint";
import { EditorView } from "@codemirror/view";

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from "worker-loader!./linter.worker";

const linterWorker = new Worker();

export const tygerPythonLinter = () => {
  const source = (view: EditorView): Promise<Diagnostic[]> => {
    const code = view.state.doc.sliceString(0);
    return new Promise((resolve) => {
      linterWorker.addEventListener(
        "message",
        (e: MessageEvent) => {
          const errors = e.data;
          resolve(
            errors.map((error: any) => ({
              severity: "error",
              // We have an offset but hard to display clearly.
              from: view.state.doc.line(error.line + 1).from,
              to: view.state.doc.line(error.line + 1).to,
              source: "TygerPython",
              message: error.msg,
            }))
          );
        },
        { once: true }
      );
      linterWorker.postMessage(code);
    });
  };
  return linter(source);
};
