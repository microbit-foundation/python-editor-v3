/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Diagnostic, linter } from "@codemirror/lint";
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
            errors.map((error: any) => {
              return {
                severity: "error",
                // So that the go-to-next error feature works we highlight
                // from the offset to the end of the line (as we don't have
                // an end position). Not great when the error is at the end
                // of a line.
                from: view.state.doc.line(error.line + 1).from + error.offset,
                to: view.state.doc.line(error.line + 1).to,
                message: error.msg,
              };
            })
          );
        },
        { once: true }
      );
      linterWorker.postMessage(code);
    });
  };
  return linter(source);
};
