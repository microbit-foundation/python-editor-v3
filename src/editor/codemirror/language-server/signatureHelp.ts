/**
 * Signature help. This shows a documentation tooltip when a user is
 * writing a function signature. Currently triggered by the opening
 * bracket.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StateEffect, StateField } from "@codemirror/state";
import { showTooltip, Tooltip } from "@codemirror/tooltip";
import {
  EditorView,
  logException,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import {
  SignatureHelp,
  SignatureHelpParams,
  SignatureHelpRequest,
} from "vscode-languageserver-protocol";
import { BaseLanguageServerView } from "./common";
import { renderDocumentation } from "./documentation";
import { offsetToPosition } from "./positions";

interface SignatureChangeEffect {
  pos: number;
  result: SignatureHelp | null;
}

const setSignatureHelpEffect = StateEffect.define<SignatureChangeEffect>({});

interface SignatureHelpState {
  tooltip: Tooltip | null;
  result: SignatureHelp | null;
}

const signatureHelpTooltipField = StateField.define<SignatureHelpState>({
  create: () => ({
    result: null,
    tooltip: null,
  }),
  update(state, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSignatureHelpEffect)) {
        return reduceSignatureHelpState(state, effect.value);
      }
    }
    return state;
  },
  provide: (f) => showTooltip.from(f, (val) => val.tooltip),
});

export class SignatureHelpView
  extends BaseLanguageServerView
  implements PluginValue
{
  update({ docChanged, selectionSet, transactions }: ViewUpdate) {
    if (
      (docChanged || selectionSet) &&
      this.view.state.field(signatureHelpTooltipField).tooltip
    ) {
      this.triggerSignatureHelpRequest();
    } else if (docChanged) {
      const last = transactions[transactions.length - 1];
      if (
        last.isUserEvent("input.type") ||
        last.isUserEvent("input.drop.apidocs")
      ) {
        last.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
          if (
            inserted.sliceString(inserted.length - 1) === "(" ||
            inserted.sliceString(inserted.length - 2) === "()"
          ) {
            this.triggerSignatureHelpRequest();
          }
        });
      }
    }
  }

  async triggerSignatureHelpRequest() {
    const pos = this.view.state.selection.main.from;
    const params: SignatureHelpParams = {
      textDocument: { uri: this.uri },
      position: offsetToPosition(this.view.state.doc, pos),
    };
    try {
      const result = await this.client.connection.sendRequest(
        SignatureHelpRequest.type,
        params
      );
      this.view.dispatch({
        effects: [setSignatureHelpEffect.of({ pos, result })],
      });
    } catch (e) {
      logException(this.view.state, e, "signature-help");
      this.view.dispatch({
        effects: [setSignatureHelpEffect.of({ pos, result: null })],
      });
    }
  }
}

const reduceSignatureHelpState = (
  state: SignatureHelpState,
  effect: SignatureChangeEffect
): SignatureHelpState => {
  if (state.tooltip && !effect.result) {
    return {
      result: null,
      tooltip: null,
    };
  }
  // It's a bit weird that we always update the position, but VS Code does this too.
  // I think ideally we'd have a notion of "same function call". Does the
  // node have a stable identity?
  if (effect.result) {
    const result = effect.result;
    return {
      result,
      tooltip: {
        pos: effect.pos,
        above: true,
        // This isn't great but the impact is really bad when it conflicts with autocomplete.
        // strictSide: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "cm-signature-tooltip";
          dom.appendChild(formatSignatureHelp(result));
          return { dom };
        },
      },
    };
  }
  return state;
};

const formatSignatureHelp = (result: SignatureHelp): Node => {
  // There's more we could do here to provide interactive UI to see all signatures.
  const { documentation, label } = result.signatures[result.activeSignature!];
  return renderDocumentation(documentation ?? label);
};

const signatureHelpToolTipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-signature-tooltip": {
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "500px",
  },
});

export const signatureHelp = () => {
  return [
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
  ];
};
