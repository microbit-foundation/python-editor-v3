import { MarkupContent } from "vscode-languageserver-types";

export const formatDocumentation = (documentation: MarkupContent | string) => {
  // Obviously inadequate!
  if (MarkupContent.is(documentation)) {
    return documentation.value;
  }
  return documentation;
};
