/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import DOMPurify from "dompurify";
import { marked } from "marked";
import { IntlShape } from "react-intl";
import { MarkupContent } from "vscode-languageserver-types";
import { moduleAndApiFromId } from "../../../documentation/api/apidocs-util";
import { ApiReferenceMap } from "../../../documentation/mapping/content";
import { splitDocString } from "./docstrings";
import "./documentation.css";

export const enum DocSections {
  Summary = 1 << 0,
  Example = 1 << 1,
  Remainder = 1 << 2,
  All = Summary | Example | Remainder,
}

export const renderDocumentation = (
  documentation: MarkupContent | string | undefined,
  parts: DocSections = DocSections.All
): Element => {
  if (!documentation) {
    documentation = "No documentation";
  }
  const div = document.createElement("div");
  div.className = "docs-spacing docs-code docs-code-muted";
  if (MarkupContent.is(documentation) && documentation.kind === "markdown") {
    try {
      div.innerHTML = renderMarkdown(documentation.value, parts).__html;
      return div;
    } catch (e) {
      // Fall through to simple text below.
    }
  }
  let fallbackContent = MarkupContent.is(documentation)
    ? documentation.value
    : documentation;
  fallbackContent = subsetMarkdown(fallbackContent, parts);
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
    .replace(/:param ([^:]+):/g, "`$1`: ")
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
  parts: DocSections = DocSections.All
): SanitisedHtml => {
  const html = DOMPurify.sanitize(
    marked.parse(fixupMarkdown(subsetMarkdown(markdown, parts)), { gfm: true })
  );
  return {
    __html: html,
  };
};

export const subsetMarkdown = (
  markdown: string,
  parts: DocSections
): string => {
  const split = splitDocString(markdown);
  let sections = [];
  if (parts & DocSections.Summary && split.summary) {
    sections.push(split.summary);
  }
  if (parts & DocSections.Example && split.example) {
    sections.push("`" + split.example + "`");
  }
  if (parts & DocSections.Remainder && split.remainder) {
    sections.push(split.remainder);
  }
  return sections.join("\n\n");
};

const createStyledAnchorElement = (): HTMLAnchorElement => {
  const anchor = document.createElement("a");
  anchor.href = "";
  anchor.style.fontSize = "var(--chakra-fontSizes-sm)";
  anchor.style.color = "var(--chakra-colors-brand-600)";
  anchor.style.display = "block";
  anchor.style.margin = "0";
  anchor.style.padding = "0.5rem";
  anchor.style.alignSelf = "flex-end";
  return anchor;
};

export const wrapWithDocumentationButton = (
  intl: IntlShape,
  child: Element,
  id: string,
  referenceLink: string | undefined
): Element => {
  const docsAndActions = document.createElement("div");
  docsAndActions.style.display = "flex";
  docsAndActions.style.height = "100%";
  docsAndActions.style.flexDirection = "column";
  docsAndActions.style.justifyContent = "space-between";
  docsAndActions.appendChild(child);

  const actionsContainer = docsAndActions.appendChild(
    document.createElement("div")
  );
  actionsContainer.style.display = "flex";
  actionsContainer.style.alignItems = "center";
  actionsContainer.style.justifyContent = "flex-end";
  actionsContainer.style.gap = "0.25rem";
  actionsContainer.style.marginRight = "-0.5rem";
  if (referenceLink) {
    const refAnchor = createStyledAnchorElement();
    refAnchor.textContent = intl.formatMessage({ id: "help" });
    refAnchor.onclick = (e) => {
      e.preventDefault();
      document.dispatchEvent(
        new CustomEvent("cm/openDocs", {
          detail: {
            tab: "reference",
            id: referenceLink,
          },
        })
      );
    };
    actionsContainer.appendChild(refAnchor);
  }
  // We don't have documentation for builtins yet,
  // so there is nothing to link to.
  const { pythonModuleName } = moduleAndApiFromId(id);
  if (pythonModuleName !== "builtins") {
    const apiAnchor = createStyledAnchorElement();
    apiAnchor.textContent = intl.formatMessage({ id: "api-tab" });
    apiAnchor.onclick = (e) => {
      e.preventDefault();
      // Could we instead interact with the history API here?
      document.dispatchEvent(
        new CustomEvent("cm/openDocs", {
          detail: {
            tab: "api",
            id,
          },
        })
      );
    };
    if (referenceLink) {
      const verticalDivider = document.createElement("hr");
      verticalDivider.style.height = "1rem";
      verticalDivider.style.borderRight = "1px solid #2C2C2C";
      verticalDivider.setAttribute("aria-orientation", "vertical");
      actionsContainer.appendChild(verticalDivider);
    }
    actionsContainer.appendChild(apiAnchor);
  }
  return docsAndActions;
};

export const getLinkToReference = (
  id: string,
  apiReferenceMap: ApiReferenceMap
): string | undefined => {
  const { pythonModuleName, apiId } = moduleAndApiFromId(id);
  if (!pythonModuleName && !apiId) {
    return;
  }
  let referenceLink = apiReferenceMap[pythonModuleName]?.[apiId]?.referenceLink;
  const alternative = apiReferenceMap[pythonModuleName]?.[apiId]?.alternative;
  if (referenceLink && alternative) {
    referenceLink = `${encodeURIComponent(referenceLink)}/${encodeURIComponent(
      alternative
    )}`;
  }
  return referenceLink;
};
