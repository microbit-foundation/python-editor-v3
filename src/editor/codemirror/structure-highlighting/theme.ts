import { EditorView } from "@codemirror/view";

export const baseTheme = EditorView.baseTheme({
  // The layer we add to CM's DOM.
  // We set additional classes here to vary the formatting of the descendant blocks.
  // See VisualBlock for the element creation code.
  ".cm-cs--layer": {
    position: "absolute",
    top: 0,
    height: "100%",
    width: "100%",
    zIndex: -1,
  },
  ".cm-cs--block, .cm-cs--indent": {
    display: "block",
    position: "absolute",
  },
  ".cm-cs--block": {
    borderRadius: "var(--chakra-radii-lg)",
  },
  // Disable border radius when it looks bad.
  ".cm-cs--lshapes .cm-cs--block": {
    borderRadius: "unset",
  },
  ".cm-cs--borders-left-edge-only .cm-cs--block": {
    borderRadius: "unset",
  },

  ".cm-cs--background-block .cm-cs--block": {
    backgroundColor: "var(--chakra-colors-code-block)",
  },
  ".cm-cs--lshapes .cm-cs--body": {
    // Keep corner flush with parent above in the l-shape.
    borderTopLeftRadius: "unset",
  },

  // l-shaped left-edge-only border
  ".cm-cs--lshapes.cm-cs--borders-left-edge-only .cm-cs--indent": {
    borderRight: "2px solid var(--chakra-colors-code-border)",
    borderTop: "2px solid var(--chakra-colors-code-border)",
  },
  // boxes left-edge only border
  ".cm-cs--boxes.cm-cs--borders-left-edge-only .cm-cs--block": {
    borderLeft: "2px solid var(--chakra-colors-code-border)",
  },

  // l-shapes full border
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--indent": {
    borderTop: "2px solid var(--chakra-colors-code-border)",
  },
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--parent": {
    borderTop: "2px solid var(--chakra-colors-code-border)",
    borderRight: "2px solid var(--chakra-colors-code-border)",
    borderLeft: "2px solid var(--chakra-colors-code-border)",
  },
  ".cm-cs--lshapes.cm-cs--borders-borders .cm-cs--body": {
    borderRight: "2px solid var(--chakra-colors-code-border)",
    borderLeft: "2px solid var(--chakra-colors-code-border)",
    borderBottom: "2px solid var(--chakra-colors-code-border)",
  },

  // boxes full border
  ".cm-cs--boxes.cm-cs--borders-borders .cm-cs--block": {
    border: "2px solid var(--chakra-colors-code-border)",
  },
});

export const themeTweakForBackgrounds = EditorView.theme({
  ".cm-activeLine": {
    // Can't use background colour for conflicting purposes.
    backgroundColor: "unset",
    outline: "1px solid var(--chakra-colors-gray-100)",
  },
});
