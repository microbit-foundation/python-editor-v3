import { MarkupContent } from "vscode-languageserver-types";
import render from "marked";
import DOMPurify from "dompurify";

import "./documentation.css";

export const renderDocumentation = (
  documentation: MarkupContent | string | undefined
): Element => {
  if (!documentation) {
    documentation = "No documentation";
  }
  const div = document.createElement("div");
  div.className = "docs-markdown";
  if (MarkupContent.is(documentation) && documentation.kind === "markdown") {
    try {
      div.innerHTML = DOMPurify.sanitize(
        render(documentation.value, {
          gfm: true,
        })
      );
      return div;
    } catch (e) {
      // Fall through to simple text below.
    }
  }
  const fallbackContent = MarkupContent.is(documentation)
    ? documentation.value
    : documentation;
  div.appendChild(new Text(fallbackContent));
  return div;
};
