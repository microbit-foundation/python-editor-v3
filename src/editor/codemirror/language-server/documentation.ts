import { MarkupContent } from "vscode-languageserver-types";
import render from "marked";
import DOMPurify from "dompurify";

import "./documentation.css";

export const renderDocumentation = (
  documentation: MarkupContent | string | undefined
): Node => {
  if (!documentation) {
    documentation = "No documentation";
  }
  const div = document.createElement("div");
  div.className = "docs-markdown";
  if (MarkupContent.is(documentation)) {
    try {
      div.innerHTML = DOMPurify.sanitize(
        render(documentation.value, {
          gfm: true,
        })
      );
      return div;
    } catch (e) {
      div.innerText = documentation.value;
    }
  } else {
    div.innerText = documentation;
  }
  return div;
};
