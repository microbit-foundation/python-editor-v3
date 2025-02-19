/**
 * (c) 2022, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import type { PluginValue, ViewUpdate } from "@codemirror/view";
import { EditorView, ViewPlugin } from "@codemirror/view";
import { IntlShape } from "react-intl";
import { ApiReferenceMap } from "../../../documentation/mapping/content";
import {
  DiagnosticsEvent,
  LanguageServerClient,
} from "../../../language-server/client";
import { Logging } from "../../../logging/logging";
import { Action, setDiagnostics } from "../lint/lint";
import { autocompletion } from "./autocompletion";
import { BaseLanguageServerView, clientFacet, uriFacet } from "./common";
import { diagnosticsMapping } from "./diagnostics";
import { signatureHelp } from "./signatureHelp";
import { MicrobitWebUSBConnection } from "@microbit/microbit-connection";

/**
 * The main extension. This synchronises the diagnostics between the client
 * and the active editor (based on the given uri) and dispatches changes to
 * the language server when the document changes.
 */
class LanguageServerView extends BaseLanguageServerView implements PluginValue {
  private diagnosticsListener = (event: DiagnosticsEvent) => {
    const params = event.detail;
    if (params.uri === this.uri) {
      const diagnostics = diagnosticsMapping(
        this.view.state.doc,
        params.diagnostics,
        this.device,
        this.warnOnV2OnlyFeatures,
        this.warnOnV2OnlyFeaturesAction
      );
      this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
    }
  };
  private destroyed = false;
  private onDeviceStatusChanged = () => {
    const diagnostics = diagnosticsMapping(
      this.view.state.doc,
      this.client.allDiagnostics(),
      this.device,
      this.warnOnV2OnlyFeatures,
      this.warnOnV2OnlyFeaturesAction
    );
    this.view.dispatch(setDiagnostics(this.view.state, diagnostics));
  };
  private warnOnV2OnlyFeaturesAction = (): Action => {
    return {
      name: this.intl.formatMessage({ id: "warn-on-v2-only-features-action" }),
      apply: () => {
        this.disableV2OnlyFeaturesWarning();
      },
    };
  };

  constructor(
    view: EditorView,
    private device: MicrobitWebUSBConnection,
    private intl: IntlShape,
    private warnOnV2OnlyFeatures: boolean,
    private disableV2OnlyFeaturesWarning: () => void
  ) {
    super(view);

    this.client.addEventListener("diagnostics", this.diagnosticsListener);
    this.device.addEventListener("status", this.onDeviceStatusChanged);

    // Is there a better way to do this? We can 't dispatch at this point.
    // It would be best to do this with initial state and avoid the dispatch.
    setTimeout(() => {
      if (!this.destroyed) {
        const diagnostics = diagnosticsMapping(
          view.state.doc,
          this.client.currentDiagnostics(this.uri),
          device,
          warnOnV2OnlyFeatures,
          this.warnOnV2OnlyFeaturesAction
        );
        view.dispatch(setDiagnostics(view.state, diagnostics));
      }
    }, 0);
  }

  update({ docChanged }: ViewUpdate) {
    if (docChanged) {
      // We should do incremental updates here
      // See https://github.com/microbit-foundation/python-editor-v3/issues/256
      this.client.didChangeTextDocument(this.uri, [
        { text: this.view.state.doc.toString() },
      ]);
    }
  }

  destroy() {
    this.destroyed = true;
    this.client.removeEventListener("diagnostics", this.diagnosticsListener);
    this.device.removeEventListener("status", this.onDeviceStatusChanged);
    // We don't own the client/connection which might outlive us, just our notifications.
  }
}

interface Options {
  signatureHelp: {
    automatic: boolean;
  };
  warnOnV2OnlyFeatures: boolean;
}

interface Actions {
  disableV2OnlyFeaturesWarning: () => void;
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
  device: MicrobitWebUSBConnection,
  uri: string,
  intl: IntlShape,
  logging: Logging,
  apiReferenceMap: ApiReferenceMap,
  options: Options,
  actions: Actions
) {
  return [
    uriFacet.of(uri),
    clientFacet.of(client),
    ViewPlugin.define(
      (view) =>
        new LanguageServerView(
          view,
          device,
          intl,
          options.warnOnV2OnlyFeatures,
          actions.disableV2OnlyFeaturesWarning
        )
    ),
    signatureHelp(intl, options.signatureHelp.automatic, apiReferenceMap),
    autocompletion(intl, logging, apiReferenceMap),
  ];
}
