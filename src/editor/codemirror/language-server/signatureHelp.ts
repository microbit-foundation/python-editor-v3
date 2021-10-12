/**
 * Signature help. This shows a documentation tooltip when a user is
 * writing a function signature. Currently triggered by the opening
 * bracket.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { StateEffect, StateField, Text } from "@codemirror/state";
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
import { removeFullyQualifiedName } from "./names";
import { offsetToPosition } from "./positions";
import { escapeRegExp } from "./regexp-util";

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

const formatSignatureHelp = ({
  activeSignature: activeSignatureIndex,
  signatures,
}: SignatureHelp): Node => {
  // We intentionally do something minimal here to minimise distraction.
  const activeSignature =
    activeSignatureIndex === null
      ? signatures[0]
      : signatures[activeSignatureIndex!];
  const {
    label,
    parameters,
    activeParameter: activeParameterIndex,
  } = activeSignature;
  const activeParameter =
    activeParameterIndex !== undefined && parameters
      ? parameters[activeParameterIndex]
      : undefined;
  const activeParameterLabel = activeParameter?.label;
  if (Array.isArray(activeParameterLabel)) {
    const [from, to] = activeParameterLabel;
    return renderHighlightedParameter(label, from, to);
  } else if (typeof activeParameterLabel === "string") {
    const parameterRegExp = new RegExp(
      "[(, ]" + escapeRegExp(activeParameterLabel) + "[), ]"
    );
    const match = parameterRegExp.exec(label);
    if (match) {
      const from = match.index + 1;
      const to = from + activeParameterLabel.length;
      return renderHighlightedParameter(label, from, to);
    }
  }
  return renderHighlightedParameter(label, label.length, label.length);
};

const renderHighlightedParameter = (
  label: string,
  from: number,
  to: number
) => {
  let before = label.substring(0, from);
  const parameter = label.substring(from, to);
  const after = label.substring(to);

  // Do this after using the indexes, not to the original label.
  before = removeFullyQualifiedName(before);

  const parent = document.createElement("div");
  parent.className = "docs-markdown";
  const code = parent.appendChild(document.createElement("code"));
  code.appendChild(document.createTextNode(before));
  const span = code.appendChild(document.createElement("span"));
  span.className = "cm-signature-activeParameter";
  span.appendChild(document.createTextNode(parameter));
  code.appendChild(document.createTextNode(after));
  return parent;
};

const signatureHelpToolTipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-signature-tooltip": {
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "500px",
  },
  ".cm-tooltip .cm-signature-activeParameter": {
    fontWeight: "bold",
  },
});

export const signatureHelp = () => {
  return [
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
  ];
};
