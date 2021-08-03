/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { setDiagnostics } from "@codemirror/lint";
import type { PluginValue, ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import * as LSP from "vscode-languageserver-protocol";
import { LanguageServerClient } from "../../../language-server/client";
import { autocompletion } from "./autocompletion";
import { diagnosticsMapping } from "./diagnostics";

/**
 * The main extension. This synchronises the diagnostics between the client
 * and the active editor (based on the given uri) and dispatches changes to
 * the language server when the document changes.
 */
class LanguageServerView implements PluginValue {
  private diagnosticsListener = (params: LSP.PublishDiagnosticsParams) => {
    if (params.uri === this.uri) {
      const diagnostics = diagnosticsMapping(
        this.view.state.doc,
        params.diagnostics
      );
      this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    }
  };

  constructor(
    private client: LanguageServerClient,
    private view: EditorView,
    private uri: string
  ) {
    this.client.on("diagnostics", this.diagnosticsListener);

    // Is there a better way to do this? We can't dispatch at this point.
    // It would be best to do this with initial state and avoid the dispatch.
    setTimeout(() => {
      const initialDiagnostics = this.client.currentDiagnostics(uri);
      view.dispatch(
        setDiagnostics(
          view.state,
          diagnosticsMapping(this.view.state.doc, initialDiagnostics)
        )
      );
    }, 0);
  }

  update({ docChanged }: ViewUpdate) {
    if (docChanged) {
      // We should do incremental updates here
      // See https://github.com/microbit-foundation/python-editor-next/issues/256
      this.client.didChangeTextDocument(this.uri, [
        { text: this.view.state.doc.toString() },
      ]);
    }
  }

  destroy() {
    this.client.removeListener("diagnostics", this.diagnosticsListener);
    // We don't own the client/connection which might outlive us, just our notifications.
  }
}

/**
 * Extensions that make use of a language server client.
 *
 * The client should generally outlive any given editor.
 *
 * @param client The client.
 * @param uri The uri of the open document.
 * @returns Extensions.
 */
export function languageServer(client: LanguageServerClient, uri: string) {
  // Would it make sense to use document state for client, uri?
  // If we did that then it would be easy to pick and choose client
  // functionality.
  return [
    ViewPlugin.define((view) => new LanguageServerView(client, view, uri)),
    autocompletion(client, uri),
  ];
}
