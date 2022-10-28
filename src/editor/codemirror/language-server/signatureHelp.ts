/**
 * Signature help. This shows a documentation tooltip when a user is
 * writing a function signature. Currently triggered by the opening
 * bracket.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState, StateEffect, StateField } from "@codemirror/state";
import {
  Command,
  EditorView,
  KeyBinding,
  keymap,
  logException,
  PluginValue,
  showTooltip,
  ViewPlugin,
  ViewUpdate,
} from "@codemirror/view";
import { IntlShape } from "react-intl";
import {
  MarkupContent,
  SignatureHelp,
  SignatureHelpParams,
  SignatureHelpRequest,
} from "vscode-languageserver-protocol";
import { ApiReferenceMap } from "../../../documentation/mapping/content";
import { BaseLanguageServerView, clientFacet, uriFacet } from "./common";
import {
  DocSections,
  getLinkToReference,
  renderDocumentation,
  wrapWithDocumentationButton,
} from "./documentation";
import { nameFromSignature, removeFullyQualifiedName } from "./names";
import { offsetToPosition } from "./positions";

export const setSignatureHelpRequestPosition = StateEffect.define<number>({});

export const setSignatureHelpResult = StateEffect.define<SignatureHelp | null>(
  {}
);

class SignatureHelpState {
  /**
   * -1 for no signature help requested.
   */
  pos: number;
  /**
   * The latest result we want to display.
   *
   * This may be out of date while we wait for async response from LSP
   * but we display it as it's generally useful.
   */
  result: SignatureHelp | null;

  constructor(pos: number, result: SignatureHelp | null) {
    if (result && pos === -1) {
      throw new Error("Invalid state");
    }
    this.pos = pos;
    this.result = result;
  }
}

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

const triggerSignatureHelpRequest = async (
  view: EditorView,
  state: EditorState
): Promise<void> => {
  const uri = state.facet(uriFacet)!;
  const client = state.facet(clientFacet)!;
  const pos = state.selection.main.from;
  const params: SignatureHelpParams = {
    textDocument: { uri },
    position: offsetToPosition(state.doc, pos),
  };
  try {
    // Must happen before other event handling that might dispatch more
    // changes that invalidate our position.
    queueMicrotask(() => {
      view.dispatch({
        effects: [setSignatureHelpRequestPosition.of(pos)],
      });
    });
    const result = await client.connection.sendRequest(
      SignatureHelpRequest.type,
      params
    );
    view.dispatch({
      effects: [setSignatureHelpResult.of(result)],
    });
  } catch (e) {
    logException(state, e, "signature-help");
    view.dispatch({
      effects: [setSignatureHelpResult.of(null)],
    });
  }
};

const openSignatureHelp: Command = (view: EditorView) => {
  triggerSignatureHelpRequest(view, view.state);
  return true;
};

export const signatureHelp = (
  intl: IntlShape,
  automatic: boolean,
  apiReferenceMap: ApiReferenceMap
) => {
  const signatureHelpTooltipField = StateField.define<SignatureHelpState>({
    create: () => new SignatureHelpState(-1, null),
    update(state, tr) {
      let { pos, result } = state;
      for (const effect of tr.effects) {
        if (effect.is(setSignatureHelpRequestPosition)) {
          pos = effect.value;
        } else if (effect.is(setSignatureHelpResult)) {
          result = effect.value;
          if (result === null) {
            // No need to ask for more updates until triggered again.
            pos = -1;
          }
        }
      }
      // Even if we just got a result, if the position has been cleared we don't want it.
      if (pos === -1) {
        result = null;
      }

      pos = pos === -1 ? -1 : tr.changes.mapPos(pos);
      if (state.pos === pos && state.result === result) {
        // Avoid pointless tooltip updates. If nothing else it makes e2e tests hard.
        return state;
      }
      return new SignatureHelpState(pos, result);
    },
    provide: (f) =>
      showTooltip.from(f, (val) => {
        const { result, pos } = val;
        if (result) {
          return {
            pos,
            above: true,
            // This isn't great but the impact is really bad when it conflicts with autocomplete.
            // strictSide: true,
            create: () => {
              const dom = document.createElement("div");
              dom.className = "cm-signature-tooltip";
              dom.appendChild(formatSignatureHelp(result, apiReferenceMap));
              return { dom };
            },
          };
        }
        return null;
      }),
  });

  const closeSignatureHelp: Command = (view: EditorView) => {
    if (view.state.field(signatureHelpTooltipField).pos !== -1) {
      view.dispatch({
        effects: setSignatureHelpRequestPosition.of(-1),
      });
      return true;
    }
    return false;
  };

  const signatureHelpKeymap: readonly KeyBinding[] = [
    // This matches VS Code.
    { key: "Mod-Shift-Space", run: openSignatureHelp },
    { key: "Escape", run: closeSignatureHelp },
  ];

  class SignatureHelpView
    extends BaseLanguageServerView
    implements PluginValue
  {
    constructor(view: EditorView, private automatic: boolean) {
      super(view);
    }
    update(update: ViewUpdate) {
      if (
        (update.docChanged || update.selectionSet) &&
        this.view.state.field(signatureHelpTooltipField).pos !== -1
      ) {
        triggerSignatureHelpRequest(this.view, update.state);
      } else if (this.automatic && update.docChanged) {
        const last = update.transactions[update.transactions.length - 1];

        // This needs to trigger for autocomplete adding function parens
        // as well as normal user input with `closebrackets` inserting
        // the closing bracket.
        if (last.isUserEvent("input") || last.isUserEvent("dnd.drop.call")) {
          last.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
            if (inserted.sliceString(0).trim().endsWith("()")) {
              triggerSignatureHelpRequest(this.view, update.state);
            }
          });
        }
      }
    }
  }

  const formatSignatureHelp = (
    help: SignatureHelp,
    apiReferenceMap: ApiReferenceMap
  ): Node => {
    const { activeSignature: activeSignatureIndex, signatures } = help;
    // We intentionally do something minimal here to minimise distraction.
    const activeSignature =
      activeSignatureIndex === null
        ? signatures[0]
        : signatures[activeSignatureIndex!];
    const {
      label,
      parameters,
      documentation: signatureDoc,
      activeParameter: activeParameterIndex,
    } = activeSignature;
    const activeParameter =
      activeParameterIndex !== undefined && parameters
        ? parameters[activeParameterIndex]
        : undefined;
    const activeParameterLabel = activeParameter?.label;
    const activeParameterDoc = activeParameter?.documentation;
    if (typeof activeParameterLabel === "string") {
      throw new Error("Not supported");
    }
    let from = label.length;
    let to = label.length;
    if (Array.isArray(activeParameterLabel)) {
      [from, to] = activeParameterLabel;
    }
    return formatHighlightedParameter(
      label,
      from,
      to,
      signatureDoc,
      activeParameterDoc,
      apiReferenceMap
    );
  };

  const formatHighlightedParameter = (
    label: string,
    from: number,
    to: number,
    signatureDoc: string | MarkupContent | undefined,
    activeParameterDoc: string | MarkupContent | undefined,
    apiReferenceMap: ApiReferenceMap
  ): Node => {
    let before = label.substring(0, from);
    const id = nameFromSignature(before);
    const parameter = label.substring(from, to);
    const after = label.substring(to);

    // Do this after using the indexes, not to the original label.
    before = removeFullyQualifiedName(before);

    const parent = document.createElement("div");
    parent.className = "docs-spacing";
    const signature = parent.appendChild(document.createElement("code"));
    signature.className = "cm-signature-signature";
    signature.appendChild(document.createTextNode(before));
    const span = signature.appendChild(document.createElement("span"));
    span.className = "cm-signature-activeParameter";
    span.appendChild(document.createTextNode(parameter));
    signature.appendChild(document.createTextNode(after));
    parent.appendChild(document.createElement("hr"));

    if (activeParameterDoc) {
      parent.appendChild(
        renderDocumentation(activeParameterDoc, DocSections.All)
      );
      parent.appendChild(
        renderDocumentation(signatureDoc, DocSections.Example)
      );
    } else {
      // No params so show summary and example from the signature docstring.
      parent.appendChild(
        renderDocumentation(
          signatureDoc,
          DocSections.Summary | DocSections.Example
        )
      );
    }
    const referenceLink = getLinkToReference(id, apiReferenceMap);
    return wrapWithDocumentationButton(intl, parent, id, referenceLink);
  };

  return [
    // View only handles automatic triggering.
    ViewPlugin.define((view) => new SignatureHelpView(view, automatic)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
    keymap.of(signatureHelpKeymap),
    EditorView.domEventHandlers({
      blur(event, view) {
        // Close signature help as it interacts badly with drag and drop if
        // you drag over the tooltip. Deal with the special case of focus
        // moving to the tooltip itself.
        if (
          !(event.relatedTarget instanceof Element) ||
          !event.relatedTarget.closest(".cm-signature-tooltip")
        ) {
          view.dispatch({
            effects: setSignatureHelpRequestPosition.of(-1),
          });
        }
      },
    }),
  ];
};
