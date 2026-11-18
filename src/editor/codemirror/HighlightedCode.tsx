/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { pythonLanguage } from "@codemirror/lang-python";
import { highlightCode } from "@lezer/highlight";
import React, { ReactNode, useInsertionEffect, useMemo } from "react";
import { StyleModule } from "style-mod";
import { css } from "styled-system/css";
import { Box } from "styled-system/jsx";
import { SystemStyleObject } from "styled-system/types";
import { highlighters } from "./config";

interface HighlightedCodeProps {
  code: string;
  css?: SystemStyleObject;
}

const highlightModules = highlighters.flatMap((h) =>
  h.module ? [h.module] : []
);

interface Line {
  /** Offset of the line's start in the code, which identifies it. */
  from: number;
  content: ReactNode[];
}

const highlight = (source: string): Line[] => {
  // Line breaks as CodeMirror reads them; some documentation content has CRLFs.
  const code = source.replace(/\r\n?/g, "\n");
  let pos = 0;
  const lines: Line[] = [{ from: pos, content: [] }];
  highlightCode(
    code,
    pythonLanguage.parser.parse(code),
    highlighters,
    (text, classes) => {
      const { content } = lines[lines.length - 1];
      content.push(
        classes ? (
          <span key={pos} className={classes}>
            {text}
          </span>
        ) : (
          text
        )
      );
      pos += text.length;
    },
    () => {
      pos += 1;
      lines.push({ from: pos, content: [] });
    }
  );
  return lines;
};

/**
 * Python code with the editor's syntax highlighting, for read-only examples.
 *
 * Static text rather than a CodeMirror view, whose content element is always a
 * textbox. The layout matches the editor's lines.
 */
const HighlightedCode = ({ code, css: cssProp }: HighlightedCodeProps) => {
  // The editor mounts these too, but the documentation can be open without
  // it. Same order as the editor's, which puts our style last.
  useInsertionEffect(() => {
    StyleModule.mount(document, highlightModules);
  }, []);
  const lines = useMemo(() => highlight(code), [code]);
  return (
    <Box css={cssProp}>
      <div
        translate="no"
        dir="ltr"
        className={css({
          fontFamily: "code",
          fontSize: "md",
          // Not the editor's 1.4: a whole-pixel line height at 16px
          // sidestepped https://bugs.webkit.org/show_bug.cgi?id=225695 on
          // Safari (#369) when this used to be a CodeMirror instance. Now this
          // is static text it may no longer be needed, but we're matching the
          // old look.
          lineHeight: 1.375,
          whiteSpace: "pre",
          tabSize: 4,
        })}
      >
        {lines.map(({ from, content }) => (
          <div key={from} className={css({ p: "0 2px 0 4px" })}>
            {content.length > 0 ? content : <br />}
          </div>
        ))}
      </div>
    </Box>
  );
};

export default React.memo(HighlightedCode);
