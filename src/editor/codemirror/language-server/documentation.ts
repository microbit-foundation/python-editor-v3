/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import DOMPurify from "dompurify";
import render from "marked";
import { MarkupContent } from "vscode-languageserver-types";
import "./documentation.css";
import { flags } from "../../../flags";

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

export const wrapWithDocumentationButton = (child: Element, id: string) => {
  const wrapper = document.createElement("div");
  wrapper.style.display = "flex";
  wrapper.style.height = "100%";
  wrapper.style.flexDirection = "column";
  wrapper.style.justifyContent = "space-between";
  wrapper.appendChild(child);

  // Nothing to link to without this flag.
  if (flags.toolkit) {
    const button = child.appendChild(document.createElement("button"));
    button.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="none" d="M0 0h24v24H0z"/><path d="M2 3.993A1 1 0 0 1 2.992 3h18.016c.548 0 .992.445.992.993v16.014a1 1 0 0 1-.992.993H2.992A.993.993 0 0 1 2 20.007V3.993zM12 5v14h8V5h-8zm1 2h6v2h-6V7zm0 3h6v2h-6v-2z"/></svg>';
    // TODO: How do we get translations here?
    button.ariaLabel = "Show reference documentation";
    button.onclick = () => {
      document.dispatchEvent(
        new CustomEvent("cm/openDocs", {
          detail: {
            id,
          },
        })
      );
    };
    button.style.display = "block";
    button.style.margin = "0";
    button.style.marginRight = "-0.5rem";
    button.style.padding = "0.5rem";
    button.style.alignSelf = "flex-end";

    wrapper.appendChild(button);
  }
  return wrapper;
};
