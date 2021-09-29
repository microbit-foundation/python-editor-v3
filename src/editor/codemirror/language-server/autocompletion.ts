/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  autocompletion as cmAutocompletion,
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import sortBy from "lodash.sortby";
import * as LSP from "vscode-languageserver-protocol";
import {
  CompletionItemKind,
  CompletionTriggerKind,
} from "vscode-languageserver-protocol";
import { LanguageServerClient } from "../../../language-server/client";
import { clientFacet, uriFacet } from "./common";
import { offsetToPosition } from "./positions";

// Used to find the true start of the completion. Doesn't need to exactly match
// any language's identifier definition.
const identifierLike = /[a-zA-Z0-9_\u{a1}-\u{10ffff}]+/u;

export const autocompletion = () =>
  cmAutocompletion({
    override: [
      async (context: CompletionContext): Promise<CompletionResult | null> => {
        const client = context.state.facet(clientFacet);
        const uri = context.state.facet(uriFacet);
        if (!client || !uri || !client.capabilities?.completionProvider) {
          return null;
        }

        let triggerKind: CompletionTriggerKind | undefined;
        let triggerCharacter: string | undefined;
        const before = context.matchBefore(identifierLike);
        if (context.explicit || before) {
          triggerKind = CompletionTriggerKind.Invoked;
        } else {
          const triggerCharactersRegExp = createTriggerCharactersRegExp(client);
          const match =
            triggerCharactersRegExp &&
            context.matchBefore(triggerCharactersRegExp);
          if (match) {
            triggerKind = CompletionTriggerKind.TriggerCharacter;
            triggerCharacter = match.text;
          } else {
            return null;
          }
        }

        const results = await client.completionRequest({
          textDocument: {
            uri,
          },
          position: offsetToPosition(context.state.doc, context.pos),
          context: {
            triggerKind,
            triggerCharacter,
          },
        });
        return {
          from: before ? before.from : context.pos,
          // Could vary these based on isIncomplete? Needs investigation.
          // Very desirable to set most of the time to remove flicker.
          filter: true,
          span: identifierLike,
          options: sortBy(
            results.items
              // For now we don't support these edits (they that usually add imports).
              .filter((x) => !x.additionalTextEdits)
              .map((item) => {
                const completion: Completion & { sortText: string } = {
                  // In practice we don't get textEdit fields back from Pyright so the label is used.
                  label: item.label,
                  type: item.kind ? mapCompletionKind[item.kind] : undefined,
                  detail: item.detail,
                  info: resolveDocumentation,
                  sortText: item.sortText ?? item.label,
                  boost: boost(item),
                };
                return completion;
              }),
            (item) => item.sortText
          ),
        };
      },
    ],
  });

const resolveDocumentation = async (completion: Completion): Promise<Node> => {
  const div = document.createElement("div");
  div.innerText = "No docs for " + completion.label;
  return div;
};

const createTriggerCharactersRegExp = (
  client: LanguageServerClient
): RegExp | undefined => {
  const characters = client.capabilities?.completionProvider?.triggerCharacters;
  if (characters && characters.length > 0) {
    return new RegExp("[" + escapeRegex(characters.join("")) + "]");
  }
  return undefined;
};

const mapCompletionKind = Object.fromEntries(
  Object.entries(CompletionItemKind).map(([key, value]) => [
    value,
    key.toLowerCase(),
  ])
) as Record<CompletionItemKind, string>;

const escapeRegex = (unescaped: string) => {
  return unescaped.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
};

const boost = (item: LSP.CompletionItem): number | undefined => {
  if (item.label.startsWith("__")) {
    return -99;
  }
  if (item.kind === CompletionItemKind.Class) {
    // A bit of a hack, aimed at demoting display.Image.
    return -1;
  }
  return undefined;
};
