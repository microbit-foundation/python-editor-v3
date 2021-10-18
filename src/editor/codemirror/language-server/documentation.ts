/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import DOMPurify from "dompurify";
import render from "marked";
import { MarkupContent } from "vscode-languageserver-types";
import "./documentation.css";

export const firstParagraph = (markup: string) => markup.split(/\n{2,}/g)[0];

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
    .replace(/\\\*\\\*/g, "**")
    .replace(/:param ([^:]+):/g, "**$1**: ")
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

export const wrapWithDocumentationButton = (child: Element, id: string) => {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.height = "100%";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = "space-between";
  wrapper.appendChild(child);

  const button = child.appendChild(document.createElement("button"));
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1rem" height="1rem"><path fill="none" d="M0 0h24v24H0z"/><path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"/></svg>';
  button.ariaLabel = "More info";
  button.onclick = () => {
    document.dispatchEvent(
      new CustomEvent("cm/openDocs", {
        detail: {
          id,
        },
      })
    );
  };
  button.style.marginTop = "auto";
  button.style.display = "block";
  button.style.float = "right";
  button.style.margin = "0";
  button.style.paddingTop = "0.5rem";
  button.style.paddingBottom = "0.5rem";
  button.style.alignSelf = "flex-end";

  wrapper.appendChild(button);

  return wrapper;
};
