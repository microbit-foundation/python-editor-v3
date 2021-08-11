/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  CompletionSource,
  completeFromList,
  ifNotIn,
} from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "@lezer/common";
import { keywords } from "./python";

/**
 * Very basic completion.
 *
 * Currently supports keywords and in scope class/function/variables.
 * Stop and write tests before taking this further as it's a pain to
 * try out interactively and easy to unit test.
 *
 * - The completion pop-up flashes if you have variable matches. We've done something wrong!
 *   Just keywords, or e.g. the JavaScript CodeMirror demo are fine, so fixable.
 * - Snippets for keywords
 * - Imported names (but for `from microbit import *` we'll need cross-file analysis)
 *   Maybe we should encourage better imports for more constrained completion?
 * - Completion on "." based on type analysis. If we can find something good then this
 *   might push us towards a language server as most of the types will be from other files.
 * - Details for variable names/scoping?
 *     - `:=` operator (though not in Python 3.4)
 *     - global/nonlocal?
 * - ... ?
 */

const avoidSimpleCompletionAncestors = [
  "String",
  "FormatString",
  "Comment",
  ".",
];

const isNodeAncestorOf = (
  potentialAncestor: SyntaxNode,
  node: SyntaxNode | null
): boolean => {
  if (!node) {
    return false;
  }
  if (
    node.from === potentialAncestor.from &&
    node.to === potentialAncestor.to
  ) {
    return true;
  }
  return isNodeAncestorOf(potentialAncestor, node.parent);
};

/**
 * Finds variables assigned to in the current scope.
 */
const inScopeVariableNames: CompletionSource = ({ state, pos }) => {
  const tree = syntaxTree(state);
  const original = tree.resolve(pos, -1);
  const visibleNames: string[] = [];

  const collect = (node: SyntaxNode | null) => {
    if (!node) {
      return;
    }
    const isNamedScope =
      node.type.name === "FunctionDefinition" ||
      node.type.name === "ClassDefinition";
    if (node.type.name === "AssignStatement" || isNamedScope) {
      const name = node.getChild("VariableName");
      if (name) {
        visibleNames.push(state.sliceDoc(name.from, name.to));
      }
    }
    if (isNamedScope && !isNodeAncestorOf(original, node)) {
      // Descendants are out of scope.
      // TODO: Consider global keyword.
      return;
    }
    let child = node.firstChild;
    while (child) {
      collect(child);
      child = child.nextSibling;
    }
  };
  collect(tree.topNode);

  const options = visibleNames.map((label) => ({
    label,
    type: "variable",
    boost: 1,
  }));
  return {
    options,
    from: original.from,
  };
};

const completeKeywords = () => {
  let completions = keywords.map((keyword) => ({
    label: keyword,
    type: "keyword",
    boost: -1,
  }));
  return completeFromList(completions);
};

export const completion: CompletionSource[] = [
  ifNotIn(avoidSimpleCompletionAncestors, completeKeywords()),
  ifNotIn(avoidSimpleCompletionAncestors, inScopeVariableNames),
];
