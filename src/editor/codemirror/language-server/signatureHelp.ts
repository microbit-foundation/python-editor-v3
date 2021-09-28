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

export const setSignatureHelpInformationEffect =
  StateEffect.define<SignatureChangeEffect>({});

interface SignatureHelpState {
  // Do we need this?
  pos: number;
  tooltip: Tooltip | null;
  result: SignatureHelp | null;
}

const signatureHelpTooltipField = StateField.define<SignatureHelpState>({
  create: () => ({
    pos: 0,
    result: null,
    tooltip: null,
  }),
  update(state, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setSignatureHelpInformationEffect)) {
        return updateSignatureHelpState(state, effect.value);
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
  update({ docChanged, selectionSet, changes, transactions }: ViewUpdate) {
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
        effects: [setSignatureHelpInformationEffect.of({ pos, result })],
      });
    } catch (e) {
      logException(this.view.state, e, "signature-help");
      this.view.dispatch({
        effects: [setSignatureHelpInformationEffect.of({ pos, result: null })],
      });
    }
  }
}

function updateSignatureHelpState(
  state: SignatureHelpState,
  effect: SignatureChangeEffect
): SignatureHelpState {
  // Triggered by typing an opening bracket (may autocomplete the trailing one).
  // Then persists so long as we get the same signature info back from
  // the language server. If it changes (commonly but not always to null) then we stop.
  // If the user types a new opening bracket then we restart the process.
  if (!state.result && effect.result) {
    const result = effect.result!;
    return {
      pos: effect.pos,
      result,
      tooltip: {
        pos: effect.pos,
        above: true,
        create: () => {
          let dom = document.createElement("div");
          dom.className = "cm-cursor-tooltip";
          dom.textContent = formatSignatureHelp(result);
          return { dom };
        },
      },
    };
  } else if (
    state.tooltip &&
    ((state.result && !effect.result) ||
      !isSameSignature(state.result!, effect.result!))
  ) {
    return {
      pos: effect.pos,
      result: null,
      tooltip: null,
    };
  }
  return state;
}

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
  ".cm-tooltip.cm-cursor-tooltip": {
    maxWidth: "50ch",
  },
});

export const signatureHelp = () => {
  return [
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
  ];
};

const isSameSignature = (a: SignatureHelp, b: SignatureHelp) => {
  if (a.signatures.length !== b.signatures.length) {
    return false;
  }
  for (let i = 0; i < a.signatures.length; ++i) {
    if (a.signatures[i].label !== b.signatures[i].label) {
      return false;
    }
    // More? Can we avoid this?
    // Need to cope with activeSig/Param changes. It's the same but different!
  }
  return true;
};
