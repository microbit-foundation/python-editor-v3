import { Tooltip, showTooltip } from "@codemirror/tooltip";
import { StateEffect, StateField } from "@codemirror/state";
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
import { offsetToPosition } from "./positions";
import { BaseLanguageServerView } from "./common";

interface SignatureRequestResponse {
  pos: number;
  result: SignatureHelp | null;
}

export const setSignatureHelpInformationEffect =
  StateEffect.define<SignatureRequestResponse>({});

const signatureHelpTooltipField = StateField.define<Tooltip | null>({
  create: () => null,
  update(tooltip, tr) {
    console.log(tr);
    for (const effect of tr.effects) {
      console.log("Woah, an effect!!");

      if (effect.is(setSignatureHelpInformationEffect)) {
        return tooltipForHelpInformation(effect.value);
      }
    }
    return tooltip;
  },
  provide: (f) => showTooltip.from(f, (val) => val),
});

export class SignatureHelpView
  extends BaseLanguageServerView
  implements PluginValue
{
  update({ docChanged, selectionSet }: ViewUpdate) {
    if (docChanged || selectionSet) {
      this.triggerSignatureHelpRequest();
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
      console.log({ params, result });
    } catch (e) {
      logException(this.view.state, e, "signature-help");
      this.view.dispatch({
        effects: [setSignatureHelpInformationEffect.of({ pos, result: null })],
      });
    }
  }
}

function tooltipForHelpInformation({
  pos,
  result,
}: SignatureRequestResponse): Tooltip | null {
  if (!result) {
    return null;
  }
  return {
    pos,
    above: false,
    create: () => {
      let dom = document.createElement("div");
      dom.className = "cm-cursor-tooltip";
      // TODO: much more!
      dom.textContent = result.signatures[result.activeSignature!].label;
      return { dom };
    },
  };
}

const signatureHelpToolTipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-cursor-tooltip": {},
});

export const cursorTooltip = () => {
  return [
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
  ];
};
