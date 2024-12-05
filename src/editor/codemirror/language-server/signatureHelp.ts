/**
 * Signature help. This shows a documentation tooltip when a user is
 * writing a function signature. Currently triggered by the opening
 * bracket.
 *
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Facet, StateEffect, StateField } from "@codemirror/state";
import {
  Command,
  EditorView,
  KeyBinding,
  PluginValue,
  ViewPlugin,
  ViewUpdate,
  keymap,
  logException,
  showTooltip,
} from "@codemirror/view";
import { IntlShape } from "react-intl";
import {
  MarkupContent,
  Position,
  SignatureHelp,
  SignatureHelpRequest,
} from "vscode-languageserver-protocol";
import { ApiReferenceMap } from "../../../documentation/mapping/content";
import { isErrorDueToDispose } from "../../../language-server/error-util";
import { BaseLanguageServerView, clientFacet, uriFacet } from "./common";
import {
  DocSections,
  getLinkToReference,
  renderDocumentation,
  wrapWithDocumentationButton,
} from "./documentation";
import { nameFromSignature, removeFullyQualifiedName } from "./names";
import { offsetToPosition } from "./positions";

export const automaticFacet = Facet.define<boolean, boolean>({
  combine: (values) => values[values.length - 1] ?? true,
});

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
   * The LSP position for pos.
   */
  position: Position | null;

  /**
   * The latest result we want to display.
   *
   * This may be out of date while we wait for async response from LSP
   * but we display it as it's generally useful.
   */
  result: SignatureHelp | null;

  constructor(
    pos: number,
    position: Position | null,
    result: SignatureHelp | null
  ) {
    if (result && pos === -1) {
      throw new Error("Invalid state");
    }
    this.pos = pos;
    this.position = position;
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

const positionEq = (a: Position | null, b: Position | null): boolean => {
  if (a === null) {
    return b === null;
  }
  if (b === null) {
    return a === null;
  }
  return a.character === b.character && a.line === b.line;
};

const openSignatureHelp: Command = (view: EditorView) => {
  view.dispatch({
    effects: [
      setSignatureHelpRequestPosition.of(view.state.selection.main.from),
    ],
  });
  return true;
};

export const signatureHelp = (
  intl: IntlShape,
  automatic: boolean,
  apiReferenceMap: ApiReferenceMap
) => {
  const signatureHelpTooltipField = StateField.define<SignatureHelpState>({
    create: () => new SignatureHelpState(-1, null, null),
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

      // By default map the previous position forward
      pos = pos === -1 ? -1 : tr.changes.mapPos(pos);

      // Did the selection moved while open? We'll re-request but keep the old result for now.
      if (pos !== -1 && tr.selection) {
        pos = tr.selection.main.from;
      }

      // Automatic triggering cases
      const automatic = tr.state.facet(automaticFacet).valueOf();
      if (
        automatic &&
        ((tr.docChanged && tr.isUserEvent("input")) ||
          tr.isUserEvent("dnd.drop.call"))
      ) {
        tr.changes.iterChanges((_fromA, _toA, _fromB, _toB, inserted) => {
          if (inserted.sliceString(0).trim().endsWith("()")) {
            // Triggered
            pos = tr.newSelection.main.from;
          }
        });
      }

      const position = pos === -1 ? null : offsetToPosition(tr.state.doc, pos);
      if (
        state.pos === pos &&
        state.result === result &&
        positionEq(state.position, position)
      ) {
        // Avoid pointless tooltip updates. If nothing else it makes e2e tests hard.
        return state;
      }
      return new SignatureHelpState(pos, position, result);
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
    private destroyed = false;
    private lastPosition: Position | null = null;

    constructor(view: EditorView) {
      super(view);
    }
    update(update: ViewUpdate) {
      const { view, state } = update;
      const uri = state.facet(uriFacet)!;
      const client = state.facet(clientFacet)!;
      const { position } = update.state.field(signatureHelpTooltipField);
      if (!positionEq(this.lastPosition, position)) {
        this.lastPosition = position;
        if (position !== null) {
          (async () => {
            try {
              const result = await client.connection.sendRequest(
                SignatureHelpRequest.type,
                {
                  textDocument: { uri },
                  position,
                }
              );
              if (!this.destroyed) {
                view.dispatch({
                  effects: [setSignatureHelpResult.of(result)],
                });
              }
            } catch (e) {
              if (!isErrorDueToDispose(e)) {
                logException(state, e, "signature-help");
              }
              // The sendRequest call can fail synchronously when disposed so we need to ensure our clean-up doesn't happen inside the CM update call.
              queueMicrotask(() => {
                if (!this.destroyed) {
                  view.dispatch({
                    effects: [setSignatureHelpResult.of(null)],
                  });
                }
              });
            }
          })();
        }
      }
    }
    destroy(): void {
      this.destroyed = true;
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
    ViewPlugin.define((view) => new SignatureHelpView(view)),
    signatureHelpTooltipField,
    signatureHelpToolTipBaseTheme,
    keymap.of(signatureHelpKeymap),
    automaticFacet.of(automatic),
    EditorView.domEventHandlers({
      blur(event, view) {
        // Close signature help as it interacts badly with drag and drop if
        // you drag over the tooltip. Deal with the special case of focus
        // moving to the tooltip itself.
        if (
          !(event.relatedTarget instanceof Element) ||
          !event.relatedTarget.closest(".cm-signature-tooltip")
        ) {
          // This can be called inside an update.
          queueMicrotask(() => {
            view.dispatch({
              effects: setSignatureHelpRequestPosition.of(-1),
            });
          });
        }
      },
    }),
  ];
};
