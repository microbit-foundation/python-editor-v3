/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import React from "react";
import { styled } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { renderMarkdown } from "../../editor/codemirror/language-server/documentation";

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
        className="docs-spacing docs-code"
        dangerouslySetInnerHTML={html}
        css={cssProp}
      />
    );
  }
);

export default DocString;
