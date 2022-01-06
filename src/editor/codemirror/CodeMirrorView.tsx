/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Box, BoxProps } from "@chakra-ui/layout";
import { useToken } from "@chakra-ui/system";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import React, { useEffect, useRef } from "react";
import "./CodeMirror.css";
import { editorConfig } from "./config";
import themeExtensions from "./themeExtensions";

interface CodeMirrorViewProps extends BoxProps {
  value: string;
}

/**
 * A React component for CodeMirror 6 in read-only mode to display code snippets.
 *
 * This is a controlled component.
 */
const CodeMirrorView = ({ value, ...props }: CodeMirrorViewProps) => {
  const elementRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const fontSize = useToken("fontSizes", "md");

  useEffect(() => {
    // We recreate everything if the value changes. We could optimise this.
    const state = EditorState.create({
      doc: value,
      extensions: [
        EditorView.editable.of(false),
        editorConfig,
        themeExtensions(fontSize),
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

  return <Box {...props} ref={elementRef} />;
};

export default React.memo(CodeMirrorView);
