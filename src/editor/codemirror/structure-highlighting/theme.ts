/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  // See VisualBlock for the element creation code.
  ".cm-cs--layer": {
    position: "absolute",
    top: 0,
    height: "100%",
    // Width is set in code.
    zIndex: -1,
  },
  ".cm-cs--block, .cm-cs--indent": {
    display: "block",
    position: "absolute",
  },
  ".cm-cs--mode-full .cm-cs--block": {
    backgroundColor: "var(--colors-code-block-background)",
  },
  ".cm-cs--mode-full .cm-cs--block.cm-cs--active": {
    backgroundColor: "var(--colors-code-block-background-active)",
  },
  ".cm-cs--indent": {
    // !important: the production cascade-layer flattening boosts the
    // global border-color reset above runtime-injected theme rules
    // (see CodeMirror.css).
    borderRight: "2px solid var(--colors-code-block-border) !important",
    borderTop: "2px solid var(--colors-code-block-border) !important",
  },
});
