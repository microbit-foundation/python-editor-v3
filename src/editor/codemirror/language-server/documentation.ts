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
      div.innerHTML = renderMarkdown(documentation.value).__html;
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

export interface SanitisedHtml {
  __html: string;
}

export const renderMarkdown = (markdown: string): SanitisedHtml => {
  return {
    __html: DOMPurify.sanitize(
      render(markdown, {
        gfm: true,
      })
    ),
  };
};
