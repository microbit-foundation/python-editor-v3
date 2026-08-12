/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import React, { useEffect, useRef } from "react";
import { Box } from "styled-system/jsx";
import { token } from "styled-system/tokens";
import { SystemStyleObject } from "styled-system/types";
import "./CodeMirror.css";
import { editorConfig } from "./config";
import themeExtensions from "./themeExtensions";

interface CodeMirrorViewProps {
  value: string;
  css?: SystemStyleObject;
}

/**
 * A React component for CodeMirror 6 in read-only mode to display code snippets.
 *
 * This is a controlled component.
 */
const CodeMirrorView = ({ value, css: cssProp }: CodeMirrorViewProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const fontSize = token("fontSizes.md");

  useEffect(() => {
    // We recreate everything if the value changes. We could optimise this.
    const state = EditorState.create({
      doc: value,
      extensions: [
        EditorView.editable.of(false),
        editorConfig,
        themeExtensions(fontSize),
        EditorView.theme({
          ".cm-scroller": {
            // Reduced from 1.4 to a value that gets integral line height on Safari with the 16px
            // font size used in Reference to sidestep https://bugs.webkit.org/show_bug.cgi?id=225695
            // See https://github.com/microbit-foundation/python-editor-v3/issues/369
            lineHeight: 1.375,
          },
        }),
      ],
    });
    const view = new EditorView({
      state,
      parent: elementRef.current!,
    });

    viewRef.current = view;

    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
  }, [value, fontSize]);

  return <Box css={cssProp} ref={elementRef} />;
};

export default React.memo(CodeMirrorView);
