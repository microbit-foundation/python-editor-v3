/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Diagnostic, setDiagnostics } from "../lint/lint";
import type { PluginValue, ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import debounce from "lodash.debounce";
import { IntlShape } from "react-intl";
import * as LSP from "vscode-languageserver-protocol";
import { LanguageServerClient } from "../../../language-server/client";
import { Logging } from "../../../logging/logging";
import { autocompletion } from "./autocompletion";
import { BaseLanguageServerView, clientFacet, uriFacet } from "./common";
import { diagnosticsMapping } from "./diagnostics";
import { signatureHelp } from "./signatureHelp";

/**
 * The main extension. This synchronises the diagnostics between the client
 * and the active editor (based on the given uri) and dispatches changes to
 * the language server when the document changes.
 */
class LanguageServerView extends BaseLanguageServerView implements PluginValue {
  private diagnosticsListener = (params: LSP.PublishDiagnosticsParams) => {
    if (params.uri === this.uri) {
      this.activeLineNumber = this.view.state.doc.lineAt(
        this.view.state.selection.main.from
      ).number;
      const diagnostics = diagnosticsMapping(
        this.view.state.doc,
        params.diagnostics
      );
      const instantDiagnostics = diagnostics.filter(
        (d) =>
          this.view.state.doc.lineAt(d.from).number !== this.activeLineNumber
      );
      this.delayedDiagnostics = diagnostics;
      this.view.dispatch(setDiagnostics(this.view.state, instantDiagnostics));
      this.debouncedDiagnostics();
    }
  };
  private delayedDiagnostics: Diagnostic[] = [];
  private debouncedDiagnostics = debounce(() => {
    this.view.dispatch(
      setDiagnostics(this.view.state, this.delayedDiagnostics)
    );
  }, 2000);
  private activeLineNumber: number | undefined;
  constructor(view: EditorView) {
    super(view);

    this.client.on("diagnostics", this.diagnosticsListener);

    // Is there a better way to do this? We can 't dispatch at this point.
    // It would be best to do this with initial state and avoid the dispatch.
    setTimeout(() => {
      const initialDiagnostics = this.client.currentDiagnostics(this.uri);
      view.dispatch(
        setDiagnostics(
          view.state,
          diagnosticsMapping(this.view.state.doc, initialDiagnostics)
        )
      );
    }, 0);
  }

  update({ docChanged, selectionSet }: ViewUpdate) {
    // We also need to refresh the diagnostics when the active line is changed via mouse.
    const activeLineChanged =
      selectionSet &&
      this.view.state.doc.lineAt(this.view.state.selection.main.from).number !==
        this.activeLineNumber;
    if (docChanged || activeLineChanged) {
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

interface Options {
  signatureHelp: {
    automatic: boolean;
  };
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
export function languageServer(
  client: LanguageServerClient,
  uri: string,
  intl: IntlShape,
  logging: Logging,
  options: Options
) {
  return [
    uriFacet.of(uri),
    clientFacet.of(client),
    ViewPlugin.define((view) => new LanguageServerView(view)),
    signatureHelp(intl, options.signatureHelp.automatic),
    autocompletion(intl, logging),
  ];
}
