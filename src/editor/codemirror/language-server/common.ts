import { Facet } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { LanguageServerClient } from "../../../language-server/client";

// What's the best way to setup a singleton required facet?
const useLast = <T>(values: readonly T[]) => values[values.length - 1]!;
// Used internally.
export const uriFacet = Facet.define<string, string>({ combine: useLast });
// Used internally.
export const clientFacet = Facet.define<
  LanguageServerClient,
  LanguageServerClient
>({ combine: useLast });

export abstract class BaseLanguageServerView {
  constructor(protected view: EditorView) {}

  protected get client() {
    return this.view.state.facet(clientFacet);
  }

  protected get uri() {
    return this.view.state.facet(uriFacet);
  }
}
