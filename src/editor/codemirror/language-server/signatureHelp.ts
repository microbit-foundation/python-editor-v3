/**
 * Signature help. This shows a documentation tooltip when a user is
 * writing a function signature. Currently triggered by the opening
 * bracket.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Tooltip, showTooltip } from "@codemirror/tooltip";
import { StateEffect, StateField, Text } from "@codemirror/state";
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
  MarkupContent,
} from "vscode-languageserver-protocol";
import { offsetToPosition } from "./positions";
import { BaseLanguageServerView } from "./common";

interface SignatureChangeEffect {
  pos: number;
  result: SignatureHelp | null;
}

export const setSignatureHelpEffect = StateEffect.define<SignatureChangeEffect>(
  {}
);

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
      if (last.isUserEvent("input.type")) {
        last.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
          if (inserted.eq(Text.of(["("])) || inserted.eq(Text.of(["()"]))) {
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
  // Triggered by typing an opening bracket (may autocomplete the trailing one).
  // Then persists so long as we get the some signature info back (it may change).
  if (!state.result && effect.result) {
    const result = effect.result;
    return {
      result,
      tooltip: {
        pos: effect.pos,
        above: true,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "cm-signature-tooltip";
          dom.textContent = formatSignatureHelp(result);
          return { dom };
        },
      },
    };
  }
  if (state.tooltip && !effect.result) {
    return {
      result: null,
      tooltip: null,
    };
  }
  return state;
};

const formatSignatureHelp = (result: SignatureHelp): string => {
  const { documentation, label } = result.signatures[result.activeSignature!];
  if (documentation) {
    if (MarkupContent.is(documentation)) {
      return documentation.value;
    }
    return documentation;
  }
  return label;
};

const signatureHelpToolTipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-signature-tooltip": {
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "400px",
  },
});

export const signatureHelp = () => {
  return [
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
  ];
};
