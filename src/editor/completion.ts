import {
  Completion,
  CompletionContext,
  CompletionSource,
  completeFromList,
  ifNotIn,
} from "@codemirror/autocomplete";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNode } from "lezer";
import { keywords } from "./python";

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
const inScopeVariables: CompletionSource = ({ state, pos }) => {
  const tree = syntaxTree(state);
  const original = tree.resolve(pos, -1);
  const variables: string[] = [];

  const collect = (node: SyntaxNode | null) => {
    if (!node) {
      return;
    }
    for (const assignStatement of node.getChildren("AssignStatement")) {
      const name = assignStatement.getChild("VariableName");
      if (name) {
        variables.push(state.sliceDoc(name.from, name.to));
      }
    }
    let child = node.firstChild;
    while (child) {
      if (
        (child.type.name !== "FunctionDefinition" &&
          child.type.name !== "ClassDefinition") ||
        isNodeAncestorOf(child, original)
      ) {
        collect(child);
      }
      child = child.nextSibling;
    }
  };
  collect(tree.topNode);

  const options = variables.map((label) => ({
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
  ifNotIn(avoidSimpleCompletionAncestors, inScopeVariables),
];
