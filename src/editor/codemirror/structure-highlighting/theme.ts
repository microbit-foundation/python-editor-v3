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
    backgroundColor: "var(--chakra-colors-code-blockBackground)",
  },
  ".cm-cs--mode-full .cm-cs--block.cm-cs--active": {
    backgroundColor: "var(--chakra-colors-code-blockBackgroundActive)",
  },
  ".cm-cs--indent": {
    borderRight: "2px solid var(--chakra-colors-code-blockBorder)",
    borderTop: "2px solid var(--chakra-colors-code-blockBorder)",
  },
});
