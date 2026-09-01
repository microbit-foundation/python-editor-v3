/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { css, cx } from "@microbit/ui";
import React from "react";
import { styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { renderMarkdown } from "../../editor/codemirror/language-server/documentation";

// Docstring links (autolinked URLs in the type stubs) must be marked by more
// than colour. Scoped here so the CodeMirror popups' anchors stay bare.
const underlineLinksClass = css({
  "& a": { textDecoration: "underline" },
});

export interface DocStringProps {
  value: string;
  /** Use span inside phrasing content (e.g. a heading subtitle). */
  as?: "div" | "span";
  css?: SystemStyleObject;
}

const DocString = React.memo(
  ({ value, as = "div", css: cssProp }: DocStringProps) => {
    const html = renderMarkdown(value);
    const Component = as === "span" ? styled.span : styled.div;
    return (
      <Component
        className={cx("docs-spacing docs-code", underlineLinksClass)}
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- documentation HTML from our own content pipeline
        dangerouslySetInnerHTML={html}
        css={cssProp}
      />
    );
  }
);

export default DocString;
