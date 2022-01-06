/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import DOMPurify from "dompurify";
import render from "marked";
import { IntlShape } from "react-intl";
import { MarkupContent } from "vscode-languageserver-types";
import "./documentation.css";

export const splitDocString = (
  markup: string
): [string, string | undefined] => {
  const parts = markup.split(/\n{2,}/g);
  const first = parts[0];
  const remainder = parts.length > 1 ? parts.slice(1).join("\n\n") : undefined;
  return [first, remainder];
};

export const firstParagraph = (markup: string) => splitDocString(markup)[0];

export const renderDocumentation = (
  documentation: MarkupContent | string | undefined,
  firstParagraphOnly: boolean = false
): Element => {
  if (!documentation) {
    documentation = "No documentation";
  }
  const div = document.createElement("div");
  div.className = "docs-markdown";
  if (MarkupContent.is(documentation) && documentation.kind === "markdown") {
    try {
      div.innerHTML = renderMarkdown(
        documentation.value,
        firstParagraphOnly
      ).__html;
      return div;
    } catch (e) {
      // Fall through to simple text below.
    }
  }
  let fallbackContent = MarkupContent.is(documentation)
    ? documentation.value
    : documentation;
  if (firstParagraphOnly) {
    fallbackContent = firstParagraph(fallbackContent);
  }
  const p = div.appendChild(document.createElement("p"));
  p.appendChild(new Text(fallbackContent));
  return div;
};

export interface SanitisedHtml {
  __html: string;
}

const fixupMarkdown = (input: string): string => {
  // Pyright's reST -> markdown conversion is imperfect.
  // Make some fixes.
  // Messy because it's after escaping. Fragile because it's regex.
  // Let's see if we can upstream or align the docs with supported syntax.
  return input
    .replace(/^\\\n/, "")
    .replace(/`([\w² \n]+?) ?<(.*?)>`\\_/gs, "[$1]($2)")
    .replace(/\\\*args/, "*args")
    .replace(/\\\*kwargs/, "*kwargs")
    .replace(/\\\*\\\*/g, "**")
    .replace(/:param ([^:]+):/g, "**`$1`**: ")
    .replace(/:return:/g, "**returns**: ");
};

// Workaround to open links in a new tab.
DOMPurify.addHook("afterSanitizeAttributes", function (node) {
  if (node.tagName === "A") {
    node.setAttribute("target", "_blank");
    node.setAttribute("rel", "noopener");
  }
});

export const renderMarkdown = (
  markdown: string,
  firstParagraphOnly: boolean = false
): SanitisedHtml => {
  if (firstParagraphOnly) {
    markdown = firstParagraph(markdown);
  }
  const html = DOMPurify.sanitize(
    render(fixupMarkdown(markdown), { gfm: true })
  );
  return {
    __html: html,
  };
};

export const wrapWithDocumentationButton = (
  intl: IntlShape,
  child: Element,
  id: string
): Element => {
  const docsAndActions = document.createElement("div");
  docsAndActions.style.display = "flex";
  docsAndActions.style.height = "100%";
  docsAndActions.style.flexDirection = "column";
  docsAndActions.style.justifyContent = "space-between";
  docsAndActions.appendChild(child);

  const button = docsAndActions.appendChild(document.createElement("button"));
  button.innerHTML =
    '<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM6 3v10h1V3H6zm3.171.345l.299-.641 1.88-.684.64.299 3.762 10.336-.299.641-1.879.684-.64-.299L9.17 3.345zm1.11.128l3.42 9.396.94-.341-3.42-9.397-.94.342zM1 2.5l.5-.5h2l.5.5v11l-.5.5h-2l-.5-.5v-11zM2 3v10h1V3H2z"></path></svg>';
  button.ariaLabel = intl.formatMessage({ id: "show-reference-documentation" });
  button.style.display = "block";
  button.style.margin = "0";
  button.style.marginRight = "-0.5rem";
  button.style.padding = "0.5rem";
  button.style.alignSelf = "flex-end";
  button.onclick = () => {
    document.dispatchEvent(
      new CustomEvent("cm/openDocs", {
        detail: {
          id,
        },
      })
    );
  };
  return docsAndActions;
};
